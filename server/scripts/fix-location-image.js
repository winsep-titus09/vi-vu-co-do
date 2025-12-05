import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function fixLocationImage() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Xóa URL ảnh lỗi của Location "Dai noi Hue"
    const result = await mongoose.connection.db.collection("locations").updateOne(
      { _id: new mongoose.Types.ObjectId("692e4e149cc91c57818116be") },
      { $set: { images: [] } }
    );

    console.log("Updated:", result.modifiedCount, "document(s)");
    
    await mongoose.disconnect();
    console.log("Done!");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fixLocationImage();
