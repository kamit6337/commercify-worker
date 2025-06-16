import { Queue } from "bullmq";
import redisClient, { createWorkerRedis } from "../../redis/redisClient.js";

const bullConnection = createWorkerRedis();

const emailQueue = new Queue("new-order-summary", {
  connection: bullConnection,
});

const addNewOrder = async (orderId) => {
  await emailQueue.add(
    `notify-${orderId}`,
    { orderId },
    {
      attempts: 3, // total 5 tries (1 original + 4 retries)
      backoff: {
        type: "exponential", // or "fixed"
        delay: 2000, // base delay in ms (1s)
      },
    }
  );
};

export default addNewOrder;
