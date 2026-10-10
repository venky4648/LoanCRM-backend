import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base health check endpoints
app.get("/", (_req, res) => {
  res.json({
    service: "loan-crm-backend",
    status: "online",
    database: env.MONGODB_DB,
  });
});

app.get("/api/v1/health", (_req, res) => {
  res.json({ ok: true, service: "loan-crm-backend", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/v1/auth", authRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Start Server & Connect Database
async function startServer() {
  await connectDB();
  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`[Loan CRM Backend] API running at http://0.0.0.0:${env.PORT}`);
    console.log(`[Loan CRM Backend] Auth Endpoints: /api/v1/auth/register | /api/v1/auth/login | /api/v1/auth/me`);
  });
}

startServer();
