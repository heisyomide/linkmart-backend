import express from "express";
import {
  createListing,
  getListings,
  getMyListings,
  deleteListing,
  updateListing,
  getApprovedListings,
  approveListing,
  rejectListing,
} from "../controllers/listingController.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// 🟢 Public Routes
router.get("/", getApprovedListings); // Show only approved listings to the public

// 🟠 Protected (User)
router.post("/", authMiddleware, createListing);
router.get("/my", authMiddleware, getMyListings);
router.put("/:id", authMiddleware, updateListing);
router.delete("/:id", authMiddleware, deleteListing);

// 🔵 Admin Routes
router.get("/all", authMiddleware, adminOnly, getListings); // All listings (any status)
router.put("/:id/approve", authMiddleware, adminOnly, approveListing);
router.put("/:id/reject", authMiddleware, adminOnly, rejectListing);

export default router;