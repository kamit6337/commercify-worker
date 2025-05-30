import { Queue, Worker } from "bullmq";
import redisClient from "../../redis/redisClient.js";
import filterFollowerIds from "../../utils/javaScript/filterFollowerIds.js";
import socketConnect from "../../lib/socketConnect.js";
import notificationMsg from "../../utils/javaScript/notificationMsg.js";
import getNotificationCountByUserIdDB from "../../database/Notification/getNotificationCountByUserIdDB.js";
import createNewNotificationDB from "../../database/Notification/createNewNotificationDB.js";

// BullMQ connection — don't use this for native Redis commands
const bullConnection = redisClient.duplicate();

const likeQueue = new Queue("like-batch", { connection: bullConnection });

export const addLikeJob = async (userId, sender, post) => {
  if (!userId || !sender || !post) {
    throw new Error("UserId or Sender or Post is not provided");
  }

  const key = `like-timer:${userId}`;
  const exists = await redisClient.exists(key);

  // Add follower to Redis list
  await redisClient.lpush(
    `like-batch-list:${userId}`,
    JSON.stringify({ sender, post })
  );

  await redisClient.sadd(`like-unqiue-postId:${userId}`, post._id);

  if (!exists) {
    // Set a TTL key to ensure only one job per 5 minutes
    await redisClient.set(key, "1", "EX", 60); // 5 mins TTL

    await redisClient.expire(`like-batch-list:${userId}`, 3 * 60);
    await redisClient.expire(`like-unqiue-postId:${userId}`, 3 * 60);

    await likeQueue.add(
      `notify-${userId}`,
      { userId },
      {
        delay: 1 * 60 * 1000,
      }
    );
  }
};

// Worker to process batch after 5 minutes
const worker = new Worker(
  "like-batch",
  async (job) => {
    try {
      const { userId } = job.data;
      const { io } = socketConnect();

      const key = `like-batch-list:${userId}`;

      const likeRaw = await redisClient.lrange(key, 0, -1);

      const uniquePostIds = await redisClient.smembers(
        `like-unqiue-postId:${userId}`
      );

      const allLikesSenderAndPost = likeRaw.map(JSON.parse);

      if (uniquePostIds.length > 0 && allLikesSenderAndPost.length > 0) {
        const uniquePostIdWithLikes = uniquePostIds.map((postId) => {
          const filterLike = allLikesSenderAndPost.filter(
            (obj) => obj.post._id === postId
          );
          return { post: postId, like: filterLike };
        });

        const promises = await Promise.all(
          uniquePostIdWithLikes.map((obj) => {
            const { post, like } = obj;

            const allSenderIds = [
              ...new Set(like.map((obj) => obj.sender._id)),
            ];

            const savingSenderIds = filterFollowerIds(allSenderIds);

            const newNotificationObj = {
              user: userId,
              type: "like",
              sender: savingSenderIds,
              totalSenders: allSenderIds.length,
              post,
            };

            return createNewNotificationDB(newNotificationObj);
          })
        );

        console.log(`[Worker] Sent Like notification to user ${userId}`);

        promises.forEach((promise) => {
          const notificationData = JSON.parse(JSON.stringify(promise));

          const findPost = allLikesSenderAndPost.find(
            (obj) =>
              obj.post._id?.toString() === notificationData.post?.toString()
          )?.post;

          const senders = notificationData.sender
            .map((userId) => {
              return allLikesSenderAndPost.find(
                (obj) => obj.sender._id === userId?.toString()
              )?.sender;
            })
            .filter(Boolean);

          io.to(userId).emit("notification", {
            ...notificationData,
            message: notificationMsg(notificationData),
            sender: senders,
            post: findPost,
          });
        });

        const notificationCount = await getNotificationCountByUserIdDB(userId);

        io.to(userId).emit("notification-count", notificationCount);
      }
      await redisClient.del(key);
      await redisClient.del(`like-unqiue-postId:${userId}`);
    } catch (error) {
      console.error("Worker error:", error);
      throw error; // BullMQ will retry automatically
    }
  },
  { connection: bullConnection }
);

// --- Worker Events ---
worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} of Like completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} of Like failed:`, err);
});

worker.on("error", (err) => {
  console.error(`[Worker] Worker of Like error:`, err);
});

console.log("[Worker] Like batch worker started");
