import { Worker } from "bullmq";
import redisClient from "../redis/redisClient.js";
import Address from "../models/AddressModels.js";
import Buy from "../models/BuyModel.js";
import {
  deleteUserOrderByOrderId,
  getUserOrderCheckoutFromRedis,
} from "../redis/order/userCheckout.js";
import addNewOrder from "../queues/emailQueues/orderSummary.js";

const bullConnection = redisClient.duplicate();

const worker = new Worker(
  "new-order",
  async (job) => {
    try {
      const { orderId, stripeId } = job.data;

      const buys = await getUserOrderCheckoutFromRedis(orderId);

      if (!buys) {
        throw new Error("Error occur in storing data");
      }

      const findAddress = buys[0].address;

      const newAddressObj = {
        ...findAddress,
      };

      delete newAddressObj._id;
      delete newAddressObj.user;
      delete newAddressObj.createdAt;
      delete newAddressObj.updatedAt;

      const addNewAddress = await Address.create(newAddressObj);

      const buyObjs = buys.map((buy) => {
        return {
          ...buy,
          stripeId,
          product: buy.product._id,
          address: addNewAddress._id,
        };
      });

      await Buy.insertMany(buyObjs);

      const isDeleted = await deleteUserOrderByOrderId(orderId);

      if (isDeleted) {
        console.log(`Deleted ${orderId} successfully`);
      }

      await addNewOrder(orderId);
    } catch (error) {
      console.error("Worker error:", error);
      throw error; // BullMQ will retry automatically
    }
  },
  { connection: bullConnection }
);

// --- Worker Events ---
worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} of Order completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} of Order failed:`, err);
});

worker.on("error", (err) => {
  console.error(`[Worker] Worker of Order error:`, err);
});

console.log("[Worker] Order batch worker started");
