import "../config/env"
import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { InvalidRow } from "../models/InvalidRow";
import { UploadSession } from "../models/UploadSession";
import { CSVBatchJob } from "../queues/ingestionQueue.";
import { validateRow } from "../utils/validator";
import { redisConnection as redis } from "../config/redis";

const PROGRESS_KEY = (jobId: string) => `progress:${jobId}`;
const BATCH_KEY = (jobId: string, batchId: string) =>
  `job:${jobId}:batch:${batchId}`;

const startWorker = async () => {
  await connectDB();
  new Worker<CSVBatchJob>(
    "csv-ingestion",
    async (job: Job<CSVBatchJob>) => {
      const { rows, jobId, sessionId } = job.data;

      const progressKey = PROGRESS_KEY(jobId);
      const batchKey = BATCH_KEY(jobId, job.id!);

      try {
        // 🔒 Prevent duplicate batch processing (idempotency)
        const alreadyProcessed = await redis.get(batchKey);
        if (alreadyProcessed) {
          return;
        }

        const validRows: any[] = [];
        const invalidRows: any[] = [];

        // 🔹 Validate rows
        for (const row of rows) {
          const error = validateRow(row);

          if (error) {
            invalidRows.push({
              row,
              error,
              sessionId,
            });
          } else {
            validRows.push({
              name: row.name,
              email: row.email,
              age: Number(row.age),
              sessionId,
            });
          }
        }

        // 🔹 Insert valid rows
        if (validRows.length > 0) {
          try {
            await User.insertMany(validRows, { ordered: false });
          } catch (err) {
            console.log("⚠️ Duplicate/partial insert handled");
          }
        }

        // 🔹 Insert invalid rows
        if (invalidRows.length > 0) {
          await InvalidRow.insertMany(invalidRows, { ordered: false });
        }

        // ✅ Mark batch as processed
        await redis.set(batchKey, "1", "EX", 60 * 60); // TTL 1 hour

        // 🔥 Atomic counter updates (safe with worker concurrency)
        await redis.hsetnx(progressKey, "total", 0);
        await redis.hset(progressKey, "status", "processing");
        await redis.hincrby(progressKey, "processed", rows.length);
        await redis.hincrby(progressKey, "valid", validRows.length);
        await redis.hincrby(progressKey, "invalid", invalidRows.length);
        await redis.expire(progressKey, 60 * 60);

        const [totalRaw, processedRaw, validRaw, invalidRaw] =
          await redis.hmget(
            progressKey,
            "total",
            "processed",
            "valid",
            "invalid",
          );

        const total = Number(totalRaw ?? "0");
        const processed = Number(processedRaw ?? "0");
        const valid = Number(validRaw ?? "0");
        const invalid = Number(invalidRaw ?? "0");

        const percentage =
          total > 0 ? Math.min(100, Math.floor((processed / total) * 100)) : 0;

        await job.updateProgress({
          processed,
          total,
          valid,
          invalid,
          percentage,
        });

        console.log(`✅ Batch processed: ${rows.length} | Total: ${processed}`);

        // 🔥 Check completion
        const completedBatches = await redis.incr(
          `job:${jobId}:completedBatches`,
        );
        const totalBatches = Number(
          (await redis.get(`job:${jobId}:totalBatches`)) ?? "0",
        );

        if (totalBatches > 0 && completedBatches >= totalBatches) {
          await redis.hset(progressKey, "status", "completed");
          await redis.expire(progressKey, 60 * 60);

          const [
            finalTotalRaw,
            finalProcessedRaw,
            finalValidRaw,
            finalInvalidRaw,
          ] = await redis.hmget(
            progressKey,
            "total",
            "processed",
            "valid",
            "invalid",
          );

          const finalTotal = Number(finalTotalRaw ?? "0");
          const finalProcessed = Number(finalProcessedRaw ?? "0");
          const finalValid = Number(finalValidRaw ?? "0");
          const finalInvalid = Number(finalInvalidRaw ?? "0");

          await job.updateProgress({
            processed: finalProcessed,
            total: finalTotal,
            valid: finalValid,
            invalid: finalInvalid,
            percentage: 100,
            type: "completed",
          });

          await UploadSession.findByIdAndUpdate(sessionId, {
            processedRows: finalProcessed,
            validRows: finalValid,
            invalidRows: finalInvalid,
            status: "completed",
          });

          console.log("🎉 JOB FULLY COMPLETED:", jobId);
        }
      } catch (err) {
        console.error("❌ Worker failed:", err);

        // 🔥 Mark job as failed in Redis
        await redis.hset(progressKey, "status", "failed");
        await redis.expire(progressKey, 60 * 60);

        await UploadSession.findByIdAndUpdate(sessionId, {
          status: "failed",
        });

        throw err; // 🔥 REQUIRED for BullMQ retry
      }
    },
    {
      connection: redis as unknown as ConnectionOptions,
      concurrency: 5,
    },
  );
};

startWorker()
  .then(() => {
    console.log("🚀 Worker started successfully");
  })
  .catch((err) => {
    console.error("💥 Worker failed to start", err);
    process.exit(1);
  });
