import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const host = process.env.REDIS_HOST || 'tough-gossamer-dependable-38620.db.redis.io';
const port = parseInt(process.env.REDIS_PORT || '13756');
const password = process.env.REDIS_PASSWORD || 'QCazH1TSihtyIcwVtS9nbO4DG4kngFBn';

export const redisConnection = new Redis({
  host,
  port,
  password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on("connect", () => {
  console.log(`Connected to Redis cloud at ${host}:${port}`);
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});
