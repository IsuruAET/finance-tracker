import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserInfo,
  uploadImage,
} from "../controllers/authControllers";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { ensureDBConnection } from "../middleware/dbMiddleware";

const router = Router();

router.post("/register", ensureDBConnection, registerUser);
router.post("/login", ensureDBConnection, loginUser);
router.get("/getUser", ensureDBConnection, protect, getUserInfo);

// ToDo: Should be protect API
router.post("/uploadImage", upload, uploadImage);

export default router;
