import ejs from "ejs";
import path from "path";

const renderOrderSummary = async (buys) => {
  const html = await ejs.renderFile(
    path.resolve("templates", "orderSummary.ejs"),
    { buys }
  );
  return html;
};

export default renderOrderSummary;
