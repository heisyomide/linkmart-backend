import express from "express";
import { createDeposit, verifyDeposit } from "../controllers/depositController.js";
import {authMiddleware} from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, createDeposit);
router.get("/verify", verifyDeposit);

export default router;