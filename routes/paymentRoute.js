import express from "express";
import {
  initiateDeposit,
  verifyDeposit,
  getPaymentHistory,
} from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/initiate", authMiddleware, initiateDeposit);
router.post("/verify", authMiddleware, verifyDeposit);
router.get("/history", authMiddleware, getPaymentHistory);

export default router;