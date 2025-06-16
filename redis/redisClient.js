import Redis from "ioredis";
import { environment } from "../utils/environment.js";

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: false, // Immediately connects when created
};

// ✅ Standard Redis client (for get/set/del etc.)
const redisClient = new Redis(environment.REDIS_URL, redisOptions);

// 📣 Publisher for Pub/Sub
export const redisPub = new Redis(environment.REDIS_URL, redisOptions);

// 👂 Subscriber for Pub/Sub
export const redisSub = new Redis(environment.REDIS_URL, redisOptions);

export function createWorkerRedis() {
  return new Redis(environment.REDIS_URL, redisOptions);
}

// Optional: log connection events for debugging
[redisClient, redisPub, redisSub].forEach((client, idx) => {
  const name = ["redisClient", "redisPub", "redisSub"][idx];

  client.on("connect", () => console.log(`${name} connected`));
  client.on("ready", () => console.log(`${name} ready`));
  client.on("error", (err) => console.error(`${name} error:`, err));
});

export default redisClient;
