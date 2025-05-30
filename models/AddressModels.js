import { Schema, model } from "mongoose";

const addressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, "Max character for Name is 100 words"],
    },
    mobile: {
      type: Number,
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value);
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit mobile number!`,
      },
      required: true,
    },
    dial_code: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxLength: [200, "Max character for Address is 200 words"],
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Address = model("Address", addressSchema);

export default Address;
