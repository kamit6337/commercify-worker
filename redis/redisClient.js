import Redis from "ioredis";
import { environment } from "../utils/environment.js";

// ✅ Standard Redis client (for get/set/del etc.)
const redisClient = new Redis(environment.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

// 📣 Publisher for Pub/Sub
export const redisPub = new Redis(environment.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

// 👂 Subscriber for Pub/Sub
export const redisSub = new Redis(environment.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

// Optional: log connection events for debugging
[redisClient, redisPub, redisSub].forEach((client, idx) => {
  const name = ["redisClient", "redisPub", "redisSub"][idx];

  client.on("connect", () => console.log(`${name} connected`));
  client.on("ready", () => console.log(`${name} ready`));
  client.on("error", (err) => console.error(`${name} error:`, err));
});

export default redisClient;
