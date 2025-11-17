import { Router } from "express";
import {
  getAllGoals,
  getGoalsByWallet,
  addGoal,
  updateGoal,
  deleteGoal,
  getGoalById,
} from "../controllers/goalControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/get", protect, getAllGoals);
router.get("/wallet", protect, getGoalsByWallet);
router.post("/add", protect, addGoal);
router.get("/:id", protect, getGoalById);
router.put("/:id", protect, updateGoal);
router.delete("/:id", protect, deleteGoal);

export default router;

