import { Router } from "express";
import {
  addIncome,
  getAllIncomes,
  deleteIncome,
  downloadIncomeExcel,
} from "../controllers/incomeControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncomes);
router.get("/downloadExcel", protect, downloadIncomeExcel);
router.delete("/:id", protect, deleteIncome);

export default router;
