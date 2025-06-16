import { Queue } from "bullmq";
import redisClient, { createWorkerRedis } from "../../redis/redisClient.js";

const bullConnection = createWorkerRedis();

const emailQueue = new Queue("product-notify-email", {
  connection: bullConnection,
});

const productNotifyEmail = async (notifies) => {
  const jobs = notifies.map((notify) => ({
    name: "notify",
    data: notify,
    opts: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    },
  }));

  await emailQueue.addBulk(jobs);
};

export default productNotifyEmail;
