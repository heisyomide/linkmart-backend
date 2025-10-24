import Campaign from "../models/Campaign.js";
import Transaction from "../models/Deposit.js";
import User from "../models/User.js";
import { notifyAdmin } from "../utils/notifyAdmin.js";

/**
 * @desc Create a new campaign
 * @route POST /api/campaigns
 * @access Private (User)
 */
export const createCampaign = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const {
      platform,
      goal,
      mediaUrl,
      caption,
      budgetUSD,
      audience,
      postUrl,
      destinationUrl,
      contactUrl,
      productUrl,
      appUrl,
    } = req.body;

    // ✅ Check wallet balance
    if (user.walletBalance < budgetUSD) {
      return res.status(400).json({ message: "Insufficient wallet balance." });
    }

    // ✅ Deduct balance immediately
    user.walletBalance -= budgetUSD;
    await user.save();

    // ✅ Create campaign (pending approval)
    const campaign = await Campaign.create({
      user: user._id,
      platform,
      goal,
      mediaUrl,
      caption,
      audience,
      postUrl,
      destinationUrl,
      contactUrl,
      productUrl,
      appUrl,
      budgetUSD,
      status: "pending",
    });

    // ✅ Create transaction (pending)
    await Transaction.create({
      userId: user._id,
      campaignId: campaign._id,
      amount: budgetUSD,
      type: "campaign",
      method: "wallet",
      status: "pending",
      description: "Campaign created - pending admin approval",
    });

    // Notify admin
    await notifyAdmin(`🆕 New ${platform} campaign pending review.`);

    res.status(201).json({
      success: true,
      message: "Campaign created successfully and pending admin approval.",
      campaign,
    });
  } catch (err) {
    console.error("❌ Error creating campaign:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all campaigns for a user
 * @route GET /api/campaigns
 * @access Private
 */
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete campaign (user/admin)
 * @route DELETE /api/campaigns/:id
 * @access Private
 */
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    if (campaign.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await campaign.deleteOne();
    res.json({ success: true, message: "Campaign deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/**
 * @desc Get all campaigns (Admin)
 * @route GET /api/campaigns/admin
 * @access Private (Admin)
 */
export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, campaigns });
  } catch (err) {
    console.error("❌ Error fetching all campaigns:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};