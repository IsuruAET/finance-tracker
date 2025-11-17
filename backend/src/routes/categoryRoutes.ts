import { Router } from "express";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "../controllers/categoryControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/get", protect, getAllCategories);
router.get("/:id", protect, getCategoryById);
router.post("/add", protect, addCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;

