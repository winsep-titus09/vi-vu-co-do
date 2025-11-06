// server/socket/index.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { setIO } from "../services/notify.js";

export function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
        const { token } = socket.handshake.auth || socket.handshake.query || {};
        let user = null;
        if (token) {
            try { user = jwt.verify(token, process.env.JWT_SECRET); } catch { }
        }

        // join theo user
        if (user?._id) {
            const uid = String(user._id);
            socket.join(`user:${uid}`); // khuyến nghị
            socket.join(uid);           // legacy
        }

        // join theo role
        const roleName = (user?.role_id?.name || user?.role || user?.roleName || "")
            .toString().trim().toLowerCase();

        if (roleName) {
            socket.join(`role:${roleName}`);
            if (roleName === "admin") socket.join("admins"); // legacy
        }

        // fallback thủ công nếu FE đang dùng
        socket.on("iam-admin", () => socket.join("admins"));
    });

    // inject io cho notify service
    setIO(io, {
        adminRooms: ["role:admin", "admins"],
        userRoomPrefix: "user:",
        alsoEmitLegacyUserIdRoom: true,
    });

    return io;
}
