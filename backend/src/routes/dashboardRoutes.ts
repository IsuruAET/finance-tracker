import { Router } from "express";
import { getDashboardData } from "../controllers/dashboardControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, getDashboardData);

export default router;
