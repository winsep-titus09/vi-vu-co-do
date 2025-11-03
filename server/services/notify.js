// services/notify.js
import Notification from "../models/Notification.js";

let ioRef = null;
export const setIO = (io) => { ioRef = io; };

// Thông báo tới admin (audience=admin)
export const notifyAdmins = async ({ type, content, url, meta = {} }) => {
    const doc = await Notification.create({
        audience: "admin",
        type,
        content,
        url,
        is_read: false,
        meta,
    });
    if (ioRef) ioRef.to("admins").emit("admin:notification:new", {
        id: doc._id, type, content, url, meta, createdAt: doc.createdAt
    });
    return doc;
};

export const notifyUser = async ({ userId, type, content, url, meta = {} }) => {
    if (!userId) throw new Error("Thiếu userId để gửi thông báo.");
    const doc = await Notification.create({
        audience: "user",
        recipientId: userId,
        type,
        content,
        url,
        meta,
        is_read: false,
    });
    if (ioRef) {
        // giả sử mỗi user có room = userId.toString()
        ioRef.to(userId.toString()).emit("user:notification:new", {
            id: doc._id,
            type, content, url, meta,
            createdAt: doc.createdAt
        });
    }
    return doc;
};
