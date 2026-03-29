// config/redis.ts
import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is not set");
}

const isTLS = process.env.REDIS_URL.startsWith("rediss://");

export const redisConnection = new Redis(process.env.REDIS_URL, {
  ...(isTLS && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
  maxRetriesPerRequest: null, // Required for BullMQ
  retryStrategy: (times) => {
    if (times > 10) {
      console.error("❌ Redis max retries reached, giving up");
      return null; // Stop retrying after 10 attempts
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: false,
  enableOfflineQueue: true,
  connectTimeout: 10000,
  lazyConnect: true,
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

redisConnection.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisConnection.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await redisConnection.quit();
});

// Explicitly connect since lazyConnect is true
redisConnection.connect().catch((err) => {
  console.error("❌ Failed to connect to Redis on startup:", err.message);
  process.exit(1); // Crash early so you know immediately
});