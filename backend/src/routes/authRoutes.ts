import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserInfo,
  uploadImage,
} from "../controllers/authControllers";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);

// ToDo: Should be protect API
router.post("/uploadImage", upload, uploadImage);

export default router;
