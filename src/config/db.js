import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB,
    });
    console.log(`[Loan CRM Backend] Connected to MongoDB Atlas (${conn.connection.host} / DB: ${env.MONGODB_DB})`);
    return conn;
  } catch (error) {
    console.error(`[Loan CRM Backend] MongoDB Connection Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
