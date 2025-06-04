import ejs from "ejs";
import path from "path";

export const renderProductGainStock = async (notify, link) => {
  const html = await ejs.renderFile(
    path.resolve("templates", "product_notify", "productGainStock.ejs"),
    { notify, productLink: link }
  );
  return html;
};

export const renderProductSaleStart = async (notify, link) => {
  const html = await ejs.renderFile(
    path.resolve("templates", "product_notify", "productSaleStart.ejs"),
    { notify, productLink: link }
  );
  return html;
};

export const renderOrderSummary = async (buys) => {
  const html = await ejs.renderFile(
    path.resolve("templates", "orders", "orderSummary.ejs"),
    { buys }
  );
  return html;
};

export const renderOrderDeliver = async (buys) => {
  const html = await ejs.renderFile(
    path.resolve("templates", "orders", "orderDeliver.ejs"),
    { buys }
  );
  return html;
};
