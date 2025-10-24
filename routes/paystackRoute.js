import express from "express";
import {
  initializePaystackDeposit,
  verifyPaystackDeposit,
  paystackWebhook,
  getUserDepositHistory,
  getDepositById,
} from "../controllers/paystackController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ✅ Initialize payment link
router.post("/create", authMiddleware, initializePaystackDeposit);

// ✅ Redirect verification (after Paystack returns to frontend)
router.get("/verify", authMiddleware, verifyPaystackDeposit);

// ✅ Webhook (Paystack will call this server-to-server)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // ✅ required to validate signature correctly
  paystackWebhook
);

// ✅ Transaction history for logged-in user
router.get("/history", authMiddleware, getUserDepositHistory);

// ✅ View a single deposit
router.get("/history/:id", authMiddleware, getDepositById);

export default router;