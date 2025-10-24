// controllers/paystackController.js
import axios from "axios";
import Deposit from "../models/Deposit.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = process.env.PAYSTACK_BASE || "https://api.paystack.co";

if (!PAYSTACK_SECRET) {
  console.warn("⚠ PAYSTACK_SECRET_KEY not set. Paystack payments will fail.");
}

// Initialize Paystack payment link
export const initializePaystackDeposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!amount || Number(amount) <= 0) return res.status(400).json({ success: false, message: "Invalid amount" });

    const reference = `PSK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Save local deposit record
    await Deposit.create({
      user: user._id,
      amount: Number(amount),
      currency: "NGN",
      reference,
      status: "pending",
      paymentGateway: "paystack",
    });

    const payload = {
      email: user.email || "noemail@linkmart.com",
      amount: Math.round(Number(amount) * 100), // Paystack expects kobo
      reference,
      callback_url: process.env.PAYBACK_REDIRECT || "http://localhost:3000/dashboard/add_fund/verify",
    };

    const response = await axios.post(`${PAYSTACK_BASE}/transaction/initialize`, payload, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    const link = response.data?.data?.authorization_url || response.data?.data?.authorization_url;

    if (!link) {
      console.error("Invalid response from Paystack initialize:", response.data);
      return res.status(500).json({ success: false, message: "Paystack did not return a payment link" });
    }

    return res.status(200).json({ success: true, link, reference });
  } catch (err) {
    // Print Paystack error body when available
    console.error("❌ initializePaystackDeposit error:", err?.response?.data || err.message || err);
    return res.status(500).json({ success: false, message: "Unable to initialize Paystack deposit" });
  }
};

// Verify after redirect (GET /verify?reference=...)
export const verifyPaystackDeposit = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.redirect("/dashboard?status=failed");

    const response = await axios.get(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      timeout: 15000,
    });

    const data = response.data?.data;
    if (!data) {
      console.error("Paystack verify returned no data:", response.data);
      return res.redirect("/dashboard?status=failed");
    }

    // find or create deposit
    let deposit = await Deposit.findOne({ reference });

    if (!deposit) {
      deposit = await Deposit.create({
        user: req.user?._id || null,
        amount: (data.amount || 0) / 100,
        reference,
        currency: data.currency || "NGN",
        status: data.status === "success" ? "successful" : "failed",
        paymentGateway: "paystack",
      });
    } else {
      // update status
      deposit.status = data.status === "success" ? "successful" : data.status;
      await deposit.save();

      if (data.status === "success" && deposit.user) {
        const user = await User.findById(deposit.user);
        if (user) {
          user.walletBalance = (user.walletBalance || 0) + deposit.amount;
          await user.save();
        }
      }
    }

    return res.redirect(`/dashboard?status=${data.status === "success" ? "success" : "failed"}`);
  } catch (err) {
    console.error("❌ verifyPaystackDeposit error:", err?.response?.data || err.message || err);
    return res.redirect("/dashboard?status=failed");
  }
};

// Webhook — must use raw body middleware on the route
export const paystackWebhook = async (req, res) => {
  try {
    // req.body here will be a Buffer only if the route used express.raw()
    const raw = req.rawBody || (req.body ? JSON.stringify(req.body) : "");
    const signature = req.header("x-paystack-signature") || "";

    if (!PAYSTACK_SECRET) {
      console.warn("Webhook received but PAYSTACK_SECRET is missing");
      return res.status(500).send("Configuration error");
    }

    // compute HMAC over raw bytes
    const crypto = await import("crypto");
    const computed = crypto.createHmac("sha512", PAYSTACK_SECRET).update(raw).digest("hex");

    if (computed !== signature) {
      console.warn("⚠ Paystack webhook signature mismatch");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body?.event || (req.body && req.body.event);
    const data = req.body?.data || (req.body && req.body.data);

    if (!event || !data) {
      return res.status(200).json({ status: "ignored" });
    }

    // handle successful transaction
    if (event === "charge.success" || event === "transaction.success") {
      const reference = data.reference;
      const amount = (data.amount || 0) / 100;
      const status = data.status;

      let deposit = await Deposit.findOne({ reference });

      if (!deposit) {
        deposit = await Deposit.create({
          user: null,
          amount,
          currency: data.currency || "NGN",
          reference,
          status: status === "success" ? "successful" : status,
          paymentGateway: "paystack",
        });
      }

      // idempotent update
      if (deposit.status !== "successful" && status === "success") {
        deposit.status = "successful";
        await deposit.save();

        if (deposit.user) {
          const user = await User.findById(deposit.user);
          if (user) {
            user.walletBalance = (user.walletBalance || 0) + deposit.amount;
            await user.save();
          }
        }
      } else if (status !== "success") {
        deposit.status = status;
        await deposit.save();
      }
    }

    return res.json({ status: "ok" });
  } catch (err) {
    console.error("❌ paystackWebhook error:", err?.response?.data || err.message || err);
    return res.status(500).json({ status: "error", message: err?.message });
  }
};

// User deposit history
export const getUserDepositHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const deposits = await Deposit.find({ user: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: deposits });
  } catch (err) {
    console.error("❌ getUserDepositHistory error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get single deposit
export const getDepositById = async (req, res) => {
  try {
    const { id } = req.params;
    const deposit = await Deposit.findById(id).populate("user", "name email");

    if (!deposit) return res.status(404).json({ success: false, message: "Deposit not found" });

    if (deposit.user && deposit.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    return res.json({ success: true, data: deposit });
  } catch (err) {
    console.error("❌ getDepositById error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};