import { Queue, Worker } from "bullmq";
import redisClient from "../../redis/redisClient.js";
import socketConnect from "../../lib/socketConnect.js";
import uniqueObjectFromArray from "../../utils/javaScript/uniqueObjectFromArray.js";
import filterFollowerIds from "../../utils/javaScript/filterFollowerIds.js";
import notificationMsg from "../../utils/javaScript/notificationMsg.js";
import getNotificationCountByUserIdDB from "../../database/Notification/getNotificationCountByUserIdDB.js";
import createNewNotificationDB from "../../database/Notification/createNewNotificationDB.js";

// BullMQ connection — don't use this for native Redis commands
const bullConnection = redisClient.duplicate();

const followQueue = new Queue("follow-batch", { connection: bullConnection });

export const addFollowJob = async (userId, follower) => {
  const key = `follow-timer:${userId}`;
  const exists = await redisClient.exists(key);

  // Add follower to Redis list
  await redisClient.lpush(
    `follow-batch-list:${userId}`,
    JSON.stringify(follower)
  );

  if (!exists) {
    // Set a TTL key to ensure only one job per 5 minutes
    await redisClient.set(key, "1", "EX", 60); // 5 mins TTL

    await redisClient.expire(`follow-batch-list:${userId}`, 3 * 60);

    await followQueue.add(
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
  "follow-batch",
  async (job) => {
    try {
      const { userId } = job.data;
      const { io } = socketConnect();

      const key = `follow-batch-list:${userId}`;

      const followersRaw = await redisClient.lrange(key, 0, -1);
      const followers = followersRaw.map(JSON.parse);

      if (followers.length > 0) {
        const uniqueFollowers = uniqueObjectFromArray(followers);

        const followerIds = uniqueFollowers.map((follower) => follower._id);

        const savingFollowerIds = filterFollowerIds(followerIds);

        const newNotificationObj = {
          user: userId,
          type: "follower",
          sender: savingFollowerIds,
          totalSenders: followerIds.length,
        };

        const newNotification = await createNewNotificationDB(
          newNotificationObj
        );

        console.log(`[Worker] Sent follow notification to user ${userId}`);

        let notification = JSON.parse(JSON.stringify(newNotification));

        const modifySender = savingFollowerIds.map((userId) => {
          return uniqueFollowers.find((follower) => follower._id === userId);
        });

        notification = { ...notification, sender: modifySender };

        io.to(userId).emit("notification", {
          message: notificationMsg(notification),
          ...notification,
        });

        const notificationCount = await getNotificationCountByUserIdDB(userId);

        io.to(userId).emit("notification-count", notificationCount);
      }
      await redisClient.del(key);
    } catch (error) {
      console.error("Worker error:", error);
      throw error; // BullMQ will retry automatically
    }
  },
  { connection: bullConnection }
);

// --- Worker Events ---
worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} Follower completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} Follower failed:`, err);
});

worker.on("error", (err) => {
  console.error(`[Worker] Worker Follower error:`, err);
});

console.log("[Worker] Follow batch worker started");
