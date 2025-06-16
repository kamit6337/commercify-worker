import { Worker } from "bullmq";
import redisClient, {
  createWorkerRedis,
  redisPub,
} from "../../redis/redisClient.js";
import Address from "../../models/AddressModel.js";
import Buy from "../../models/BuyModel.js";
import {
  deleteUserOrderByOrderId,
  getUserOrderCheckoutFromRedis,
} from "../../redis/order/userCheckout.js";
import addNewOrder from "../../queues/orders/orderSummary.js";
import Stock from "../../models/StockModel.js";

const bullConnection = createWorkerRedis();

const worker = new Worker(
  "new-order",
  async (job) => {
    try {
      const { orderId, stripeId } = job.data;
      console.log("saving new order", orderId);

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
          country: buy.country._id,
        };
      });

      await Buy.insertMany(buyObjs);

      const isDeleted = await deleteUserOrderByOrderId(orderId);

      if (isDeleted) {
        console.log(`Deleted ${orderId} successfully`);
      }

      const productIds = buyObjs.map((buy) => buy.product);

      const updateStocks = await Stock.updateMany(
        {
          product: { $in: productIds },
        },
        {
          $inc: { stock: -1 },
        }
      );

      console.log("update stocks", updateStocks);

      await redisPub.publish("update-stocks", JSON.stringify(productIds));

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
