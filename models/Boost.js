import mongoose from "mongoose";

const boostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    platform: {
      type: String,
      enum: ["facebook", "instagram", "tiktok", "x", "pinterest"],
      required: true,
    },

    type: {
      type: String,
      enum: ["followers", "likes", "views", "shares", "comments"],
      required: true,
    },

    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    orderId: { type: String }, // for TikTok API tracking
    isManual: { type: Boolean, default: true }, // false for automatic (TikTok)
  },
  { timestamps: true }
);

export default mongoose.model("Boost", boostSchema);