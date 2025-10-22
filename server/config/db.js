import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log("Đã kết nối đến MongoDB");
    } catch (error) {
        console.error("Lỗi kết nối đến MongoDB: " + error.message);
        process.exit(1);
    }
};

export default connectDB;