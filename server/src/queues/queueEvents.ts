import { ConnectionOptions, QueueEvents } from "bullmq";
import { redisConnection } from "../config/redis";

// ⚠️ SAME queue name as ingestionQueue
export const queueEvents = new QueueEvents("csv-ingestion", {
  connection: redisConnection as unknown as ConnectionOptions,
});

// Debug (optional but useful)
queueEvents.on("progress", ({ jobId, data }) => {
  console.log("📡 Progress:", jobId, data);
});

queueEvents.on("completed", ({ jobId }) => {
  console.log("✅ Completed:", jobId);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.log("❌ Failed:", jobId, failedReason);
});