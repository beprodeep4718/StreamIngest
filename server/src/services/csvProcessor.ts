import csv from "csv-parser";
import { ingestionQueue } from "../queues/ingestionQueue.js";
import { redisConnection as redis } from "../config/redis";
import { UploadSession } from "../models/UploadSession";

const BATCH_SIZE = 500;

const PROGRESS_KEY = (jobId: string) => `progress:${jobId}`;

type ProgressSnapshot = {
  total: number;
  processed: number;
  valid: number;
  invalid: number;
  status: "processing" | "completed" | "failed";
};

export const processCSVStream = async (
  fileStream: NodeJS.ReadableStream,
  jobId: string,
  sessionId: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let batch: any[] = [];
    let totalRows = 0;
    let totalBatches = 0;

    const stream = fileStream.pipe(csv());

    // 🔥 BACKPRESSURE CONTROL
    const pushBatch = async () => {
      if (batch.length === 0) return;

      totalBatches++;

      const currentBatch = batch;
      batch = [];

      console.log("🚀 Sending batch:", currentBatch.length);

      await ingestionQueue.add(
        "processBatch",
        {
          rows: currentBatch,
          jobId,
          sessionId,
        },
        {
          jobId: `${jobId}-${totalBatches}`,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
    };

    stream.on("data", async (row) => {
      stream.pause(); // 🔥 CRITICAL (prevents memory explosion)

      batch.push(row);
      totalRows++;

      if (batch.length >= BATCH_SIZE) {
        await pushBatch();
      }

      stream.resume();
    });

    stream.on("end", async () => {
      try {
        // 🔹 Final batch
        await pushBatch();

        console.log("📦 Stream Rows:", totalRows);
        console.log("📦 Batches:", totalBatches);

        const progressKey = PROGRESS_KEY(jobId);

        await redis.hsetnx(progressKey, "processed", 0);
        await redis.hsetnx(progressKey, "valid", 0);
        await redis.hsetnx(progressKey, "invalid", 0);
        await redis.hset(progressKey, "total", totalRows, "status", "processing");
        await redis.expire(progressKey, 60 * 60);

        // 🔥 Batch tracking (still needed)
        await redis.set(`job:${jobId}:totalBatches`, totalBatches);

        const completedBatchesRaw = await redis.get(`job:${jobId}:completedBatches`);
        if (!completedBatchesRaw) {
          await redis.set(`job:${jobId}:completedBatches`, 0);
        }

        // 🔥 Update DB
        await UploadSession.findByIdAndUpdate(sessionId, {
          totalRows,
          status: "processing",
        });

        // Reconcile completion in case worker finished batches before totalBatches was initialized.
        const completedBatches = Number(
          (await redis.get(`job:${jobId}:completedBatches`)) ?? "0"
        );

        if (totalBatches === 0 || completedBatches >= totalBatches) {
          await redis.hset(progressKey, "status", "completed");
          await redis.expire(progressKey, 60 * 60);

          const [processedRaw, validRaw, invalidRaw] = await redis.hmget(
            progressKey,
            "processed",
            "valid",
            "invalid"
          );

          const processed = Number(processedRaw ?? "0");
          const valid = Number(validRaw ?? "0");
          const invalid = Number(invalidRaw ?? "0");

          await UploadSession.findByIdAndUpdate(sessionId, {
            totalRows,
            processedRows: processed,
            validRows: valid,
            invalidRows: invalid,
            status: "completed",
          });
        }

        resolve();
      } catch (err) {
        console.error("❌ Stream end error:", err);

        const progressKey = PROGRESS_KEY(jobId);
        await redis.hset(progressKey, "status", "failed", "total", totalRows);
        await redis.expire(progressKey, 60 * 60);

        await UploadSession.findByIdAndUpdate(sessionId, {
          status: "failed",
        });

        reject(err);
      }
    });

    stream.on("error", async (err) => {
      console.error("❌ Stream error:", err);

      const progressKey = PROGRESS_KEY(jobId);
      await redis.hset(progressKey, "status", "failed", "total", totalRows);
      await redis.expire(progressKey, 60 * 60);

      await UploadSession.findByIdAndUpdate(sessionId, {
        status: "failed",
      });

      reject(err);
    });
  });
};