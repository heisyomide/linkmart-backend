import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createService,
    getMyServices

} from "../controllers/ServiceController.js";

const router = express.Router();

router.post("/create", authMiddleware, createService);
router.get("/", authMiddleware, getMyServices);

export default router;