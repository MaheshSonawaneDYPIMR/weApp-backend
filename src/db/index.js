import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`,
      {
        useNewUrlParser: true,
      
        useUnifiedTopology: true,
        
      }
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
