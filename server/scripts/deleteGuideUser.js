import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function deleteGuide() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await User.deleteOne({ email: "guide@example.com" });
    console.log(`✅ Deleted guide user (${result.deletedCount} deleted)`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

deleteGuide();
