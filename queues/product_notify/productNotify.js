import { Queue } from "bullmq";
import redisClient from "../../redis/redisClient.js";

const bullConnection = redisClient.duplicate();

const emailQueue = new Queue("product-notify-email", {
  connection: bullConnection,
});

const productNotifyEmail = async (notifies) => {
  const jobs = notifies.map((notify) => ({
    name: "notify",
    data: { notify: notify },
    opts: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    },
  }));

  await emailQueue.addBulk(jobs);
};

export default productNotifyEmail;
