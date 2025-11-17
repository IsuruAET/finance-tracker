import { Router } from "express";
import {
  addTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  downloadTransactionExcel,
} from "../controllers/transactionControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/add", protect, addTransaction);
router.get("/get", protect, getAllTransactions);
router.get("/download/excel", protect, downloadTransactionExcel);
router.get("/:id", protect, getTransactionById);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

export default router;

