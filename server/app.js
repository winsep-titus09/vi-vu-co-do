// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import guideRoutes from "./routes/guides.routes.js";
import userNotifyRoutes from "./routes/notifications.routes.js";
import tourRoutes from "./routes/tours.routes.js";
import locationCategoryPublicRoutes from "./routes/locationCategories.routes.js";
import locationPublicRoutes from "./routes/locations.routes.js";

// admin
import adminGuideAppRoutes from "./routes/admin/guideApplications.routes.js";
import adminNotifyRoutes from "./routes/admin/notifications.routes.js";
import adminTourRoutes from "./routes/admin/tours.routes.js";
import adminLocationCategoryRoutes from "./routes/admin/locationCategories.routes.js";
import adminLocationRoutes from "./routes/admin/locations.routes.js";

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
app.use("/api/tours", tourRoutes);
app.use("/api/location-categories", locationCategoryPublicRoutes);
app.use("/api/locations", locationPublicRoutes);

// admin api
app.use("/api/admin/guide-applications", adminGuideAppRoutes);
app.use("/api/admin/notifications", adminNotifyRoutes);
app.use("/api/admin/tours", adminTourRoutes);
app.use("/api/admin/location-categories", adminLocationCategoryRoutes);
app.use("/api/admin/locations", adminLocationRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));

export default app;
