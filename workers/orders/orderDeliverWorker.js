import { Worker } from "bullmq";
import Buy from "../../models/BuyModel.js";
import redisClient, { createWorkerRedis } from "../../redis/redisClient.js";
import { renderOrderDeliver } from "../../templates/renderEJS.js";
import sendingEmail from "../../utils/email/email.js";

const bullConnection = createWorkerRedis();

const worker = new Worker(
  "order-status",
  async (job) => {
    try {
      const { buyId } = job.data;

      const buys = await Buy.find({
        _id: buyId,
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
        ])
        .lean();

      const email = buys[0].user.email;

      const html = await renderOrderDeliver(buys);

      await sendingEmail(email, "Order Delivered", html);
    } catch (error) {
      console.error("Worker error:", error);
      throw error; // BullMQ will retry automatically
    }
  },
  { connection: bullConnection, concurrency: 5 }
);

// --- Worker Events ---
worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} of Order Status completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} of Order Status failed:`, err);
});

worker.on("error", (err) => {
  console.error(`[Worker] Worker of Order Status error:`, err);
});

console.log("[Worker] Order Status batch worker started");
