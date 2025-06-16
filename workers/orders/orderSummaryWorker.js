import { Worker } from "bullmq";
import Buy from "../../models/BuyModel.js";
import redisClient, { createWorkerRedis } from "../../redis/redisClient.js";
import { renderOrderSummary } from "../../templates/renderEJS.js";
import sendingEmail from "../../utils/email/email.js";

const bullConnection = createWorkerRedis();

const worker = new Worker(
  "new-order-summary",
  async (job) => {
    try {
      const { orderId } = job.data;

      const buys = await Buy.find({
        orderId,
      })
        .populate([
          {
            path: "user",
          },
          {
            path: "product",
          },
          {
            path: "address",
          },
          {
            path: "country",
          },
        ])
        .lean();

      const email = buys[0].user.email;

      const html = await renderOrderSummary(buys);

      await sendingEmail(email, "Order Summary", html);
    } catch (error) {
      console.error("Worker error:", error);
      throw error; // BullMQ will retry automatically
    }
  },
  { connection: bullConnection, concurrency: 5 }
);

// --- Worker Events ---
worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} of Order Summary completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} of Order Summary failed:`, err);
});

worker.on("error", (err) => {
  console.error(`[Worker] Worker of Order Summary error:`, err);
});

console.log("[Worker] Order Summary batch worker started");
