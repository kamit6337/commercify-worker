import mongoose from "mongoose";
import { environment } from "../utils/environment.js";

let isDatabaseConnected = false;

const connectToDB = async () => {
  if (isDatabaseConnected) {
    return;
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Reduce timeout for quicker retry
  };

  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(environment.MONGO_DB_URI, options);
      isDatabaseConnected = true;
      console.log("Connected to MongoDB");
      return;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      retries++;
      console.log(`Retrying MongoDB connection... Attempt ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait before retrying
    }
  }

  throw new Error("Unable to connect to MongoDB after multiple retries");
};

mongoose.connection.on("disconnected", () => {
  isDatabaseConnected = false;
  console.log("Disconnected from MongoDB");
});

export default connectToDB;
