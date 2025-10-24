import express from "express";
import {
  createBoost,
  getUserBoosts,
  getAllBoosts,
  updateBoostStatus,
  deleteBoost,
  getBoostServices,
} from "../controllers/boostController.js";
import { authMiddleware, userOnly, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Fetch available boost services
router.get("/services", authMiddleware, getBoostServices);

// User routes
router.post("/", authMiddleware, userOnly, createBoost);
router.get("/my", authMiddleware, getUserBoosts);

// Admin routes
router.get("/admin", authMiddleware, adminOnly, getAllBoosts);
router.patch("/admin/:id/status", authMiddleware, adminOnly, updateBoostStatus);
router.delete("/admin/:id", authMiddleware, adminOnly, deleteBoost);

export default router;