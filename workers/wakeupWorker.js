import { Worker } from "bullmq";
import redisClient from "../redis/redisClient.js";

const bullConnection = redisClient.duplicate();

const worker = new Worker(
  "wakeup-notify",
  async (job) => {
    try {
      const { hello } = job.data;

      console.log("wakeup hello", hello);
    } catch (error) {
      console.error("Worker error:", error);
      throw error; // BullMQ will retry automatically
    }
  },
  { connection: bullConnection }
);

// --- Worker Events ---
worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} of Wakeup completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} of Wakeup failed:`, err);
});

worker.on("error", (err) => {
  console.error(`[Worker] Worker of Wakeup error:`, err);
});

console.log("[Worker] Wakeup batch worker started");
