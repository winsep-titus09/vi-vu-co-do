// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import guideRoutes from "./routes/guides.routes.js";
import userNotifyRoutes from "./routes/notifications.routes.js";

// admin
import adminGuideAppRoutes from "./routes/admin/guideApplications.routes.js";
import adminNotifyRoutes from "./routes/admin/notifications.routes.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// api
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/notifications", userNotifyRoutes);

// admin api
app.use("/api/admin/guide-applications", adminGuideAppRoutes);
app.use("/api/admin/notifications", adminNotifyRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));

export default app;
