import redisClient from "./redisClient.js";

const checkRedisConnection = () => {
  if (!redisClient || redisClient.status !== "ready") {
    console.error("Redis client is not connected or not ready");
    return false;
  }
  return true;
};

export default checkRedisConnection;
