import { Redis } from "@upstash/redis";
import { createLogger } from "@/lib/utils/log";

const logger = createLogger({ name: "RedisStorage" });

// Prefer official helper to read env automatically (supports KV_* and UPSTASH_* vars)
// Docs: https://upstash.com/docs/redis/sdks/ts/getstarted
let client: Redis | null = null;
try {
  client = Redis.fromEnv();
} catch (_err) {
  logger.warn("Redis env not configured; Redis features will no-op");
}

// Export raw client directly
export const redis = client as Redis;

export async function testRedisConnection(): Promise<boolean> {
  try {
    const res = await redis.ping();
    return res === "PONG";
  } catch (error) {
    logger.error({ error }, "Redis connection failed");
    return false;
  }
}
