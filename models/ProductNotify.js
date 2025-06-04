import { Schema, model } from "mongoose";

const productNotifySchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notifyType: {
      type: String,
      enum: ["out_of_sale", "out_of_stock"],
      default: "out_of_sale",
    },
  },
  {
    timestamps: true,
  }
);

productNotifySchema.index({ product: 1 });

const ProductNotify = model("ProductNotify", productNotifySchema);

export default ProductNotify;
