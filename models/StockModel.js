import { Schema, model } from "mongoose";

const stockSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

stockSchema.index({ product: 1 }, { unique: true });

const Stock = model("Stock", stockSchema);

export default Stock;
