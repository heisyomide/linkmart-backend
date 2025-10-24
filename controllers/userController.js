import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Campaign from '../models/Campaign.js';
import Boost from '../models/Boost.js';
import Transaction from '../models/Deposit.js';

// =============================
// GET /api/users/profile
// =============================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// GET /api/users/wallet
// =============================
export const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// GET /api/users/dashboard
// =============================
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Run all queries concurrently
    const [listings, campaigns, boosts, transactions] = await Promise.all([
      Listing.find({ userId }),
      Campaign.find({ userId }),
      Boost.find({ userId }),
      Transaction.find({ userId }).sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate derived stats
    const totalListings = listings.length;
    const totalClicks = listings.reduce((sum, l) => sum + (l.clicks || 0), 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalReach = campaigns.reduce((sum, c) => sum + (c.reach || 0), 0);

    // Fetch wallet balance
    const user = await User.findById(userId).select('walletBalance');

    res.json({
      walletBalance: user?.walletBalance || 0,
      totalListings,
      totalClicks,
      activeCampaigns,
      totalReach,
      recentTransactions: transactions
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: err.message });
  }
};