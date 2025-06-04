import { Schema, model } from "mongoose";

const countrySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isoAlpha2: {
      type: String,
      required: true,
      trim: true,
    },
    isoAlpha3: {
      type: String,
      required: true,
      trim: true,
    },
    isoNumeric: {
      type: Number,
      required: true,
    },
    dial_code: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      _id: false,
      code: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      symbol: {
        type: String,
        required: true,
        trim: true,
      },
    },
    flag: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Country = model("Country", countrySchema);

export default Country;
