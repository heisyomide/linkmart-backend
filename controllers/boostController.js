import Boost from "../models/Boost.js";
import User from "../models/User.js";
import { fetchJPAservices, createJPAorder } from "../services/japPanelService.js";

/**
 * @desc Create a new boost request
 * @route POST /api/boosts
 * @access Private (User)
 */
export const createBoost = async (req, res) => {
  try {
const { platform, type, quantity, amount, link, serviceId } = req.body;
const userId = req.user?._id || req.user?.id;
    // ✅ 1. Validate authentication
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }

    // ✅ 2. Validate required fields
    if (!platform || !type || !quantity || !amount || !link || !serviceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ 3. Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ 4. Check user balance
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // ✅ 5. Deduct amount from balance
    user.balance -= amount;
    await user.save();

    // ✅ 6. Determine manual vs automatic
    const isManual = platform.toLowerCase() !== "tiktok";

    // ✅ 7. Create Boost record
    const boost = await Boost.create({
      user: userId,
      platform: platform.toLowerCase(),
      type: type.toLowerCase(),
      quantity,
      amount,
      isManual,
      link,
      serviceId,
      status: isManual ? "pending" : "processing",
    });

    // ✅ 8. If automatic (TikTok), trigger JPA API order
    if (!isManual) {
      try {
        const orderData = await createJPAorder(serviceId, link, quantity);
        boost.apiOrderId = orderData.order || null;
        await boost.save();
        console.log("✅ JPA API order created:", orderData);
      } catch (apiError) {
        console.error("❌ JPA API error:", apiError.message);
        boost.status = "failed";
        await boost.save();
        return res.status(500).json({
          message: "Boost created but failed to send to API",
          boost,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "✅ Boost created successfully",
      boost,
      newBalance: user.balance,
    });
  } catch (error) {
    console.error("Error creating boost:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Fetch available JPA services
 * @route GET /api/boosts/services
 */
export const getBoostServices = async (req, res) => {
  try {
    const services = await fetchJPAservices();
    res.json({
      success: true,
      services,
    });
  } catch (err) {
    console.error("❌ Error fetching JPA services:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch boost services.",
      error: err.message,
    });
  }
};

/**
 * @desc Delete a boost (Admin)
 * @route DELETE /api/boosts/admin/:id
 * @access Private (Admin)
 */
export const deleteBoost = async (req, res) => {
  try {
    const boost = await Boost.findById(req.params.id);
    if (!boost) return res.status(404).json({ message: "Boost not found" });

    await boost.deleteOne();
    res.json({ message: "Boost deleted successfully" });
  } catch (error) {
    console.error("Error deleting boost:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all boosts (Admin)
 * @route GET /api/boosts
 * @access Private (Admin)
 */
export const getAllBoosts = async (req, res) => {
  try {
    const boosts = await Boost.find().populate("user", "name email");
    res.json(boosts);
  } catch (error) {
    console.error("Error fetching boosts:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all boosts for a specific logged-in user
 * @route GET /api/boosts/user
 * @access Private (User)
 */
export const getUserBoosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const boosts = await Boost.find({ user: userId }).sort({ createdAt: -1 });
    res.json(boosts);
  } catch (error) {
    console.error("Error fetching user boosts:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update a boost's status (Admin)
 * @route PATCH /api/boosts/admin/:id/status
 * @access Private (Admin)
 */
export const updateBoostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const boost = await Boost.findById(req.params.id);

    if (!boost) {
      return res.status(404).json({ message: "Boost not found" });
    }

    boost.status = status;
    await boost.save();

    res.json({ message: "Boost status updated successfully", boost });
  } catch (error) {
    console.error("Error updating boost status:", error);
    res.status(500).json({ message: error.message });
  }
};