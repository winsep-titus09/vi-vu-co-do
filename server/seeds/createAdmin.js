import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "vi-vu-co-do" });
    console.log("✅ Connected to MongoDB");

    let adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) {
        adminRole = await Role.create({ name: "admin" });
        console.log("🆕 Created role 'admin'");
    }

    const hashed = await bcrypt.hash("123456", 10);
    const user = await User.create({
        name: "System Admin",
        email: "admin@vivucodo.com",
        password: hashed,
        phone_number: "0900000000",
        role_id: adminRole._id,
    });

    console.log("✅ Admin user created:", user.email);
    await mongoose.disconnect();
};

run();
