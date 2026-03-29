import { Queue, type ConnectionOptions } from "bullmq";
import { redisConnection } from "../config/redis.js";

export interface CSVBatchJob {
  rows: Record<string, string>[];
  jobId: string;
  sessionId: string;
}

export const ingestionQueue = new Queue<CSVBatchJob>(
  "csv-ingestion",
  {
    connection: redisConnection as unknown as ConnectionOptions
  }
);
