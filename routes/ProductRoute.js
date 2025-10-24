import express from "express";
import { createProduct, getUserProducts } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createProduct);
router.get("/my", authMiddleware, getUserProducts);

export default router;