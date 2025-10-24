import express from "express";
import {
  getAllUsers,
  updateUserStatus,
  getPendingCampaigns,
  updateCampaignStatus,
  getPlatformStats,
  getAllBoosts,
  updateBoostStatus,
    getAllDeposits,
  updateDepositStatus,
    getAllServices,
  updateServiceStatus,
  deleteService,
  getAllProducts, 
  updateProductStatus,


} from "../controllers/adminController.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware, adminOnly);

router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);

router.get("/campaigns/pending", getPendingCampaigns);
router.patch("/campaigns/:id/status", updateCampaignStatus);

router.get("/stats", getPlatformStats);

router.get("/boosts", getAllBoosts);
router.patch("/boosts/:id/status", updateBoostStatus);

router.get("/deposits", getAllDeposits);
router.patch("/:id/status", updateDepositStatus);


// Admin endpoints
router.get("/services", getAllServices);
router.patch("/:id/status", updateServiceStatus);
router.delete("/:id",deleteService);


router.get("/products", adminOnly, getAllProducts);
router.put("/products:id/status", adminOnly, updateProductStatus);







export default router;