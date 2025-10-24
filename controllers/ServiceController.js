import Service from "../models/Services.js";
import User from "../models/User.js";
import Transaction from "../models/Deposit.js";

// 🧑 USER CREATES A SERVICE
export const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, priceRange, category, whatsapp, location, platforms } = req.body;

    const cost = (platforms?.length || 0) * 10; // $10 per platform

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.balance < cost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct balance and create pending service
    user.balance -= cost;
    await user.save();

    const service = await Service.create({
      user: userId,
      title,
      description,
      priceRange,
      category,
      whatsapp,
      location,
      platforms,
      status: "pending",
    });

    // Record transaction
    await Transaction.create({
      user: userId,
      type: "debit",
      amount: cost,
      method: "Service Creation",
      status: "completed",
      reference: `SRV-${Date.now()}`,
      description: `Created service: ${title}`,
    });

    res.status(201).json({ message: "Service submitted for review", service });
  } catch (err) {
    console.error("Error creating service:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🧑‍💼 ADMIN FETCH ALL SERVICES (Pending)
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate("user", "name email");
    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ ADMIN APPROVE SERVICE
export const approveService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    service.status = "approved";
    await service.save();

    res.json({ message: "Service approved successfully", service });
  } catch (err) {
    console.error("Error approving service:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ❌ ADMIN REJECT SERVICE (Refund User)
export const rejectService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const refundAmount = (service.platforms?.length || 0) * 10;
    const user = await User.findById(service.user);

    if (user) {
      user.balance += refundAmount;
      await user.save();

      await Transaction.create({
        user: user._id,
        type: "credit",
        amount: refundAmount,
        method: "Refund",
        status: "completed",
        reference: `REF-${Date.now()}`,
        description: `Refund for rejected service: ${service.title}`,
      });
    }

    service.status = "rejected";
    await service.save();

    res.json({ message: "Service rejected and user refunded", service });
  } catch (err) {
    console.error("Error rejecting service:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// =========================
// Get logged-in user's services
// =========================
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    console.error("Error fetching user's services:", err);
    res.status(500).json({ message: "Server error" });
  }
};