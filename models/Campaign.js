import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    platform: {
      type: String,
      enum: ["facebook", "instagram", "tiktok", "youtube", "x", "pinterest", "whatsapp"],
      required: true,
    },
    goal: {
      type: String,
      enum: ["engagement", "awareness", "traffic", "leads", "sales", "app_promotion"],
      required: true,
    },

    // Dynamic fields for different goals
    postUrl: String,
    destinationUrl: String,
    contactUrl: String,
    productUrl: String,
    appUrl: String,
    mediaUrl: String,
    caption: String,
    audience: String,

    budgetUSD: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "declined"],
      default: "pending",
    },

    adminNote: String,
    refundIssued: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);