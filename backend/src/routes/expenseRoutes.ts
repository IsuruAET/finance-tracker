import { Router } from "express";
import {
  addExpense,
  getAllExpenses,
  deleteExpense,
  downloadExpenseExcel,
} from "../controllers/expenseControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpenses);
router.get("/downloadExcel", protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

export default router;
