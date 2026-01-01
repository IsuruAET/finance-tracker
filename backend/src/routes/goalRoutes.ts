import { Router } from "express";
import {
  getMonthlyGoalByWallet,
  upsertMonthlyGoal,
  deleteMonthlyGoal,
  getAllMonthlyGoals,
  getWalletMetrics,
} from "../controllers/goalControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Monthly goal routes
router.get("/monthly/wallet", protect, getMonthlyGoalByWallet);
router.get("/monthly/all", protect, getAllMonthlyGoals);
router.post("/monthly/upsert", protect, upsertMonthlyGoal);
router.delete("/monthly/delete", protect, deleteMonthlyGoal);
router.get("/wallet/metrics", protect, getWalletMetrics);

export default router;
