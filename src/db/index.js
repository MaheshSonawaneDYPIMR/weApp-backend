import mongoose from "mongoose";
import { DB_NAME } from "../constants";

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\n Connected to MongoDB !! DN HOST:${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("Error while connecting DB",error)
        process.exit(1);
    }
}
