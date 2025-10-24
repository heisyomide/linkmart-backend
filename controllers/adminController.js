import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Boost from "../models/Boost.js";
import Transaction from "../models/Deposit.js";
import Service from "../models/Services.js"; // make sure this model exists
import Product from "../models/product.js";



// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/campaigns/pending
export const getPendingCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "pending" });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc Admin updates campaign status
 * @route PATCH /api/admin/campaigns/:id/status
 * @access Private (Admin)
 */
export const updateCampaignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const campaign = await Campaign.findById(id).populate("user");
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const transaction = await Transaction.findOne({ campaignId: campaign._id });

    campaign.status = status;
    campaign.adminNote = adminNote || "";

    if (status === "approved") {
      // ✅ Campaign runs, transaction completed
      if (transaction) {
        transaction.status = "completed";
        transaction.description = "Campaign approved and running.";
        await transaction.save();
      }
    }

    if (status === "rejected") {
      // ✅ Refund user + mark transaction failed
      campaign.user.walletBalance += campaign.budgetUSD;
      await campaign.user.save();

      if (transaction) {
        transaction.status = "failed";
        transaction.description = "Campaign rejected - refund issued.";
        await transaction.save();
      }
    }

    await campaign.save();

    res.json({
      success: true,
      message:
        status === "approved"
          ? "Campaign approved and activated."
          : "Campaign rejected and refund issued.",
      campaign,
    });
  } catch (err) {
    console.error("❌ Error updating campaign status:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/stats
export const getPlatformStats = async (req, res) => {
  try {
    const [users, campaigns, boosts, earnings] = await Promise.all([
      User.countDocuments(),
      Campaign.countDocuments({ status: "active" }),
      Boost.countDocuments(),
      Transaction.aggregate([
        { $match: { status: "completed", type: "deposit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      totalUsers: users,
      activeCampaigns: campaigns,
      totalBoosts: boosts,
      totalEarnings: earnings[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET all boosts (admin only)
export const getAllBoosts = async (req, res) => {
  try {
    // populate user info if needed
    const boosts = await Boost.find()
      .populate("user", "name email") // show user name/email
      .sort({ createdAt: -1 });

    // format so frontend can display easily
    const formatted = boosts.map((b) => ({
      _id: b._id,
      user: b.user?.name || "Unknown",
      platform: b.platform,
      service: b.service,
      quantity: b.quantity,
      price: b.price,
      total: b.total,
      status: b.status,
      createdAt: b.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ PATCH boost status (admin only)
export const updateBoostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Boost.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!updated) return res.status(404).json({ error: "Boost not found" });

    res.json({
      _id: updated._id,
      user: updated.user?.name || "Unknown",
      platform: updated.platform,
      service: updated.service,
      quantity: updated.quantity,
      price: updated.price,
      total: updated.total,
      status: updated.status,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET /api/admin/deposits
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Transaction.find({ type: "deposit" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const formatted = deposits.map((d) => ({
      _id: d._id,
      user: d.user?.name || d.user?.email || "Unknown",
      method: d.method,
      amount: d.amount,
      fee: d.fee,
      total: d.total,
      status: d.status,
      createdAt: d.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ PATCH /api/admin/deposits/:id/status
export const updateDepositStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!updated) return res.status(404).json({ error: "Deposit not found" });

    res.json({
      _id: updated._id,
      user: updated.user?.name || updated.user?.email || "Unknown",
      method: updated.method,
      amount: updated.amount,
      fee: updated.fee,
      total: updated.total,
      status: updated.status,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// =============================
// GET ALL SERVICES (Admin only)
// =============================
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("user", "fullname email")
      .sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
};

// =============================
// UPDATE SERVICE STATUS
// (approve, rejected, or running)
// =============================
export const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "running", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!service) return res.status(404).json({ message: "Service not found" });

    res.status(200).json(service);
  } catch (err) {
    console.error("Error updating service status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// =============================
// DELETE A SERVICE (optional)
// =============================
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Service not found" });

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ message: "Failed to delete service" });
  }
};


// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("user", "name email");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update product status
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Product.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};