import Campaign from "../models/Campaign.js";
import Boost from "../models/Boost.js";

// GET /api/analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch campaigns and boosts owned by this user
    const campaigns = await Campaign.find({ userId });
    const boosts = await Boost.find({ userId });

    // Aggregate clicks and reach
    const clicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const reach = campaigns.reduce((sum, c) => sum + (c.reach || 0), 0);

    // Conversion rate (simple formula: clicks ÷ reach)
    const conversionRate = reach > 0 ? ((clicks / reach) * 100).toFixed(2) : 0;

    // Example chart data (replace with daily logs if you track them)
    const chartData = campaigns.map(c => ({
      date: c.createdAt.toLocaleDateString(),
      clicks: c.clicks || 0,
      reach: c.reach || 0,
    }));

    res.json({
      clicks,
      reach,
      conversionRate,
      chartData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};