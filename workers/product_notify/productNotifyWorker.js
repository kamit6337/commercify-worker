import { Worker } from "bullmq";
import redisClient, { createWorkerRedis } from "../../redis/redisClient.js";
import ProductNotify from "../../models/ProductNotify.js";
import productNotifyEmail from "../../queues/product_notify/productNotify.js";

const bullConnection = createWorkerRedis();

const worker = new Worker(
  "product-notify",
  async (job) => {
    try {
      const { productId, notifyType } = job.data;

      console.log("productId", productId);
      console.log("notifyType", notifyType);

      const notifies = await ProductNotify.find({
        product: productId,
        notifyType,
      })
        .populate([
          {
            path: "product",
          },
          {
            path: "user",
          },
        ])
        .lean();

      console.log("notifies", notifies);

      if (notifies.length === 0) {
        console.log("notifies", "No notifies avaliable");
        return;
      }

      await productNotifyEmail(notifies);
    } catch (error) {
      console.error("Worker error:", error);
      throw error; // BullMQ will retry automatically
    }
  },
  { connection: bullConnection }
);

// --- Worker Events ---
worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} of Product Notify completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} of Product Notify failed:`, err);
});

worker.on("error", (err) => {
  console.error(`[Worker] Worker of Product Notify error:`, err);
});

console.log("[Worker] Product Notify batch worker started");
