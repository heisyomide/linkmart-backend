import express from "express";
import { getUserAnalytics } from "../controllers/AnalyticsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Protect this route so only logged-in users can see their analytics
router.get("/", authMiddleware, getUserAnalytics);

export default router;