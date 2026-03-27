import express from "express";
import { queueEvents } from "../queues/queueEvents";
import { redisConnection as redis } from "../config/redis";

const router = express.Router();
const PROGRESS_KEY = (jobId: string) => `progress:${jobId}`;

type ProgressSnapshot = {
  total: number;
  processed: number;
  valid: number;
  invalid: number;
  status: "processing" | "completed" | "failed";
};

router.get("/:jobId", async (req, res) => {
  const { jobId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let isClosed = false;
  let lastPayload = "";

  const sendProgressSnapshot = async () => {
    const exists = await redis.exists(PROGRESS_KEY(jobId));
    if (!exists) {
      return;
    }

    const [totalRaw, processedRaw, validRaw, invalidRaw, statusRaw] =
      await redis.hmget(
        PROGRESS_KEY(jobId),
        "total",
        "processed",
        "valid",
        "invalid",
        "status"
      );

    const parsed: ProgressSnapshot = {
      total: Number(totalRaw ?? "0"),
      processed: Number(processedRaw ?? "0"),
      valid: Number(validRaw ?? "0"),
      invalid: Number(invalidRaw ?? "0"),
      status: (statusRaw as ProgressSnapshot["status"]) ?? "processing",
    };

    const percentage =
      parsed.status === "completed"
        ? 100
        : parsed.total > 0
        ? Math.min(100, Math.floor((parsed.processed / parsed.total) * 100))
        : 0;

    const payload = {
      processed: parsed.processed,
      total: parsed.total,
      valid: parsed.valid,
      invalid: parsed.invalid,
      percentage,
      type: parsed.status,
    };

    const payloadString = JSON.stringify(payload);

    if (payloadString !== lastPayload) {
      send(payload);
      lastPayload = payloadString;
    }

    if (parsed.status === "completed" || parsed.status === "failed") {
      cleanup();
    }
  };

  // 👇 keep connection alive
  const keepAlive = setInterval(() => {
    res.write(":\n\n"); // heartbeat
  }, 15000);

  // Poll Redis so UI still gets progress even if queue progress events are missed.
  const pollProgress = setInterval(() => {
    void sendProgressSnapshot();
  }, 1000);

  const onProgress = ({ jobId: id }: any) => {
    if (id.startsWith(jobId)) {
      void sendProgressSnapshot();
    }
  };

  const onCompleted = ({ jobId: id }: any) => {
    if (id.startsWith(jobId)) {
      // Do not close on first completed batch; Redis status decides final state.
      void sendProgressSnapshot();
    }
  };

  const onFailed = ({ jobId: id }: any) => {
    if (id.startsWith(jobId)) {
      void sendProgressSnapshot();
    }
  };

  queueEvents.on("progress", onProgress);
  queueEvents.on("completed", onCompleted);
  queueEvents.on("failed", onFailed);

  const cleanup = () => {
    if (isClosed) {
      return;
    }

    isClosed = true;
    clearInterval(keepAlive);
    clearInterval(pollProgress);
    queueEvents.off("progress", onProgress);
    queueEvents.off("completed", onCompleted);
    queueEvents.off("failed", onFailed);
    res.end();
  };

  // Send initial snapshot immediately in case processing already started.
  await sendProgressSnapshot();

  req.on("close", () => {
    cleanup();
  });
});

export default router;