import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Import hàm kết nối

// ----- CẤU HÌNH -----
// 1. Tải các biến môi trường từ file .env
dotenv.config();
// 2. Kết nối đến cơ sở dữ liệu MongoDB
connectDB();
// --------------------

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});