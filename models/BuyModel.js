import mongoose from "mongoose";
import "./UserModel.js";
import "./ProductModel.js";
import "./AddressModel.js";
import "./CountryModel.js";

const buySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
  orderId: {
    type: String,
    required: true,
    select: false,
  },
  stripeId: {
    type: String,
    required: true,
    select: false,
  },
  price: {
    type: Number,
    required: true,
  },
  buyPrice: {
    type: Number,
    required: true,
  },
  exchangeRate: {
    type: Number,
    required: true,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredDate: {
    type: Date,
    default: null,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  reasonForCancelled: {
    type: String,
    default: "",
    trim: true,
  },
  isReturned: {
    type: Boolean,
    default: false,
  },
  reasonForReturned: {
    type: String,
    default: "",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Buy = mongoose.model("Buy", buySchema);

export default Buy;
