import express from 'express';
import {
  getUserProfile,
  getWalletBalance,
  getUserDashboard
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.get('/wallet', authMiddleware, getWalletBalance);
router.get('/dashboard', authMiddleware, getUserDashboard);


export default router;