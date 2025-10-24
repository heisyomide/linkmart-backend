import express from "express";
import {
  createCampaign,
  getCampaigns,
  getAllCampaigns,
  deleteCampaign,
} from "../controllers/campaignController.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

/* -------------------- USER ROUTES -------------------- */

// ✅ Create new campaign (manual or automatic)
router.post("/", authMiddleware, createCampaign);

// ✅ Get all campaigns belonging to logged-in user
router.get("/", authMiddleware, getCampaigns);


/* -------------------- ADMIN ROUTES -------------------- */

// 🟢 Get all campaigns (admin dashboard)
router.get("/admin", authMiddleware, adminOnly, getAllCampaigns);

// 🟡 Update campaign status (approve, reject, pause, complete)
router.patch(
  "/admin/:id/status",
  authMiddleware,
  adminOnly
);

// 🔴 Delete a campaign
router.delete(
  "/admin/:id",
  authMiddleware,
  adminOnly,
  deleteCampaign
);

export default router;