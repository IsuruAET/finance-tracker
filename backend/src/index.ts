import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import incomeRoutes from "./routes/incomeRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import walletRoutes from "./routes/walletRoutes";

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

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/wallet", walletRoutes);

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
