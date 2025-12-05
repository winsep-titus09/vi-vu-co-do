// server/server.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

import http from "http";
import "./services/schedule.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initCloudinary } from "./config/cloud.js";
import { initSocket } from "./sockets/index.js";

const PORT = process.env.PORT || 5000;

await connectDB();
initCloudinary();

const server = http.createServer(app);

// Khởi tạo Socket.IO đúng chỗ, đúng 1 lần
initSocket(server);

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
