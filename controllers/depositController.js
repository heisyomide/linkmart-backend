import axios from "axios";
import dotenv from "dotenv";
import Deposit from "../models/Deposit.js";
import User from "../models/User.js";

dotenv.config();

export const createDeposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const reference = `LM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Save pending deposit
    await Deposit.create({
      user: user._id,
      amount,
      reference,
      status: "pending",
    });

    const payload = {
      email: user.email || "user@linkmart.com",
      amount: amount * 100, // Paystack works in kobo
      reference,
      callback_url: "http://localhost:3000/dashboard/add_fund/verify",
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url } = response.data.data;
    return res.status(200).json({ link: authorization_url });
  } catch (error) {
    console.error("❌ [createDeposit] error:", error.response?.data || error);
    res.status(500).json({
      message: "Unable to initialize Paystack deposit",
      error: error.message,
    });
  }
};

export const verifyDeposit = async (req, res) => {
  try {
    const { reference } = req.query;
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status === "success") {
      const deposit = await Deposit.findOneAndUpdate(
        { reference },
        { status: "successful" },
        { new: true }
      );

      if (deposit) {
        const user = await User.findById(deposit.user);
        user.balance += deposit.amount;
        await user.save();
      }

      return res.redirect("/dashboard/add_fund?status=success");
    } else {
      await Deposit.findOneAndUpdate({ reference }, { status: "failed" });
      return res.redirect("/dashboard/add_fund?status=failed");
    }
  } catch (error) {
    console.error("❌ [verifyDeposit] error:", error.response?.data || error);
    res.status(500).json({
      message: "Verification failed",
      error: error.message,
    });
  }
};