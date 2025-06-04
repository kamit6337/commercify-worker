import { Worker } from "bullmq";
import redisClient from "../../redis/redisClient.js";
import { environment } from "../../utils/environment.js";
import {
  renderProductGainStock,
  renderProductSaleStart,
} from "../../templates/renderEJS.js";
import sendingEmail from "../../utils/email/email.js";
import ProductNotify from "../../models/ProductNotify.js";

const bullConnection = redisClient.duplicate();

const worker = new Worker(
  "product-notify-email",
  async (job) => {
    try {
      const notify = job.data;

      const productId = notify.product._id;
      const userId = notify.user._id;

      const email = notify.user.email;
      const link = `${environment.CLIENT_URL}/products/${notify.product._id}`;

      if (notify.notifyType === "out_of_sale") {
        const html = await renderProductSaleStart(notify, link);
        await sendingEmail(email, "Product Sale Started", html);

        const deletedNotify = await ProductNotify.deleteMany({
          product: productId,
          user: userId,
        });
        console.log("deletedNotify", deletedNotify);
      }

      if (notify.notifyType === "out_of_stock") {
        const html = await renderProductGainStock(notify, link);
        await sendingEmail(email, "Product Available Now", html);

        const deletedNotify = await ProductNotify.deleteMany({
          product: productId,
          user: userId,
        });
        console.log("deletedNotify", deletedNotify);
      }
    } catch (error) {
      console.error("Worker error:", error);
      throw error; // BullMQ will retry automatically
    }
  },
  {
    connection: bullConnection,
    concurrency: 5, // handle 5 email jobs in parallel
  }
);

// --- Worker Events ---
worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} of Product Notify Email completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} of Product Notify Email failed:`, err);
});

worker.on("error", (err) => {
  console.error(`[Worker] Worker of Product Notify Email error:`, err);
});

console.log("[Worker] Product Notify Email batch worker started");
