import { Router } from "express";
import {
  getClientConfig,
  updateClientConfig,
} from "../controllers/clientConfigControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/get", protect, getClientConfig);
router.put("/update", protect, updateClientConfig);

export default router;

