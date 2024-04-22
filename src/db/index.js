import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const connectionInstance = await mongoose.connect(
      `mongodb+srv://maulicreations07:pass147258@cluster0.h9lytih.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log(
      `\n Connected to MongoDB !! DN HOST:${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error while connecting DB", error);
    process.exit(1);
  }
};

export { connectDB };
