import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: "",
      trim: true,
    },
    photo: {
      type: String,
      required: [true, "Please provide pic"],
      trim: true,
    },
    OAuthId: {
      type: String,
      default: null,
      select: false,
    },
    OAuthProvider: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    passwordLastUpdated: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

export default User;
