// server.js
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import "./services/schedule.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initCloudinary } from "./config/cloud.js";
import { Server } from "socket.io";
import { setIO } from "./services/notify.js";

const PORT = process.env.PORT || 5000;

await connectDB();
initCloudinary();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
    // FE Admin sau khi login: socket.emit("iam-admin")
    socket.on("iam-admin", () => socket.join("admins"));
});
setIO(io);
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
