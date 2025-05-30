import redisClient from "../redisClient.js";

export const getUserOrderCheckoutFromRedis = async (orderId) => {
  if (!orderId) return null;

  const get = await redisClient.get(`Order-Checkout:${orderId}`);

  return get ? JSON.parse(get) : null;
};

export const setUserOrderCheckoutIntoRedis = async (orderId, order) => {
  if (!orderId || !order) return;

  await redisClient.set(
    `Order-Checkout:${orderId}`,
    JSON.stringify(order),
    "EX",
    3600
  );
};

export const deleteUserOrderByOrderId = async (orderId) => {
  if (!orderId) return;

  const result = await redisClient.del(`Order-Checkout:${orderId}`);
  return result === 1;
};
