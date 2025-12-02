// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { globalLimiter } from "./middleware/rateLimit.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import guideRoutes from "./routes/guides.routes.js";
import userNotifyRoutes from "./routes/notifications.routes.js";
import locationCategoryPublicRoutes from "./routes/locationCategories.routes.js";
import locationPublicRoutes from "./routes/locations.routes.js";
import models3dRoutes from "./routes/models3d.routes.js";
import tourRoutes from "./routes/tours.routes.js";
import tourCategoryRoutes from "./routes/tourCategories.routes.js";
import tourRequestRoutes from "./routes/tour-requests.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import payoutsRoutes from "./routes/payouts.routes.js";

// Blog public
import articleRoutes from "./routes/articles.routes.js";
import articleCategoryPublicRoutes from "./routes/articleCategories.routes.js";

// admin
import adminGuideAppRoutes from "./routes/admin/guideApplications.routes.js";
import adminNotifyRoutes from "./routes/admin/notifications.routes.js";
import adminLocationCategoryRoutes from "./routes/admin/locationCategories.routes.js";
import adminLocationRoutes from "./routes/admin/locations.routes.js";
import adminTourRoutes from "./routes/admin/tours.routes.js";
import adminTourRequestRoutes from "./routes/admin/tour-requests.routes.js";
import adminPaymentSettingRoutes from "./routes/admin/paymentSettings.routes.js";
import adminRefundRoutes from "./routes/admin/refunds.routes.js";
import adminRevueneRoutes from "./routes/admin/revenue.routes.js";
import adminPayoutRoutes from "./routes/admin/payouts.routes.js";
import adminDashboardRoutes from "./routes/admin/dashboard.routes.js";

// Blog admin
import adminArticleCategoryRoutes from "./routes/admin/articleCategories.routes.js";

// 3D Models admin
import adminModels3DRoutes from "./routes/admin/models3d.routes.js";

// Reviews admin
import adminReviewsRoutes from "./routes/admin/reviews.routes.js";

// Users admin
import adminUsersRoutes from "./routes/admin/users.routes.js";

const app = express();

// ============================================================================
// CORS CONFIGURATION
// ============================================================================
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.set("trust proxy", 1);

// api
app.use("/api", globalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/notifications", userNotifyRoutes);
app.use("/api/location-categories", locationCategoryPublicRoutes);
app.use("/api/locations", locationPublicRoutes);
app.use("/api/models3d", models3dRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/tour-categories", tourCategoryRoutes);
app.use("/api/tour-requests", tourRequestRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payouts", payoutsRoutes);

// blog public
app.use("/api/articles", articleRoutes);
app.use("/api/article-categories", articleCategoryPublicRoutes);

// admin api
app.use("/api/admin/guide-applications", adminGuideAppRoutes);
app.use("/api/admin/notifications", adminNotifyRoutes);
app.use("/api/admin/location-categories", adminLocationCategoryRoutes);
app.use("/api/admin/locations", adminLocationRoutes);
app.use("/api/admin/tours", adminTourRoutes);
app.use("/api/admin/tour-requests", adminTourRequestRoutes);
app.use("/api/admin/payment-settings", adminPaymentSettingRoutes);
app.use("/api/admin/refunds", adminRefundRoutes);
app.use("/api/admin/revenues", adminRevueneRoutes);
app.use("/api/admin/payouts", adminPayoutRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// blog admin
app.use("/api/admin/article-categories", adminArticleCategoryRoutes);

// 3D Models admin
app.use("/api/admin/models3d", adminModels3DRoutes);

// Reviews admin
app.use("/api/admin/reviews", adminReviewsRoutes);

// Users admin
app.use("/api/admin/users", adminUsersRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));

export default app;
