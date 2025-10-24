import express from "express";
import { createCampaign, getCampaigns } from "../controllers/campaignController.js";
import { authMiddleware } from "../middleware/auth.js";
const router = express.Router();

router.post("/", authMiddleware, createCampaign);
router.get("/", authMiddleware, getCampaigns);

export default router;