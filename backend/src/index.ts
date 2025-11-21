import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import goalRoutes from "./routes/goalRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import walletRoutes from "./routes/walletRoutes";
import clientConfigRoutes from "./routes/clientConfigRoutes";

dotenv.config();

const app: Application = express();

// Middleware to handle CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://finance-tracker-frontend-kappa.vercel.app",
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Preflight will be handled by the global CORS middleware above

app.use(express.json());

// Health check endpoint (for monitoring and keep-alive)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Connect to database - non-blocking
connectDB().catch((err) => {
  console.error("Failed to connect to database:", err);
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/client-config", clientConfigRoutes);

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
