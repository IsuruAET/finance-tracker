import { Router } from "express";
import {
  initializeWallets,
  getAllWallets,
  addWallet,
  transferBetweenWallets,
  getTransfers,
  deleteWallet,
  updateWallet,
} from "../controllers/walletControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/initialize", protect, initializeWallets);
router.get("/get", protect, getAllWallets);
router.post("/add", protect, addWallet);
router.post("/transfer", protect, transferBetweenWallets);
router.get("/transfers", protect, getTransfers);
router.put("/:id", protect, updateWallet);
router.delete("/:id", protect, deleteWallet);

export default router;
