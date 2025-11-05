import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Import routes
import AuthRoute from './routes/AuthRoute.js';
import UserRoute from './routes/userRoute.js';
import ListingRoute from './routes/listingRoute.js';
import CampaignRoute from './routes/campaignRoute.js';
import BoostRoute from './routes/boostRoute.js';
import SocialRoute from './routes/socialRoute.js';
import PaymentRoute from './routes/paymentRoute.js';
import AdminRoute from './routes/AdminRoute.js';
import AnalyticsRoute from './routes/AnalyticsRoute.js'
import ServiceRoute from './routes/ServiceRoute.js'
import ProductRoute from './routes/ProductRoute.js'
import depositRoute from './routes/depositRoutes.js'
import paystackRoute from './routes/paystackRoute.js'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect Database
connectDB();

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/users', UserRoute);
app.use('/api/listings', ListingRoute);
app.use('/api/campaigns', CampaignRoute);
app.use('/api/boosts', BoostRoute);
app.use('/api/social', SocialRoute);
app.use('/api/payments', PaymentRoute);
app.use('/api/admin', AdminRoute);
app.use('/api/analytics', AnalyticsRoute);
app.use('/api/services', ServiceRoute);
app.use('/api/products', ProductRoute)
app.use('/api/deposits', depositRoute)
app.use('/api/paystack', paystackRoute)

// Health check
app.get('/health', (_, res) => res.json({ ok: true }));

app.get("/", (req, res) => {
  res.send("🚀 Linkmart Backend API is running successfully!");
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));