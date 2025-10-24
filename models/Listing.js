import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Core info
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ["product", "service", "promotion"],
      required: true,
    },

    // Product or service details
    price: { type: Number, default: 0 },
    mediaUrls: [{ type: String }], // multiple photos/videos
    whatsappLink: { type: String, trim: true }, // for e-commerce WhatsApp redirect
    businessProfileLink: { type: String, trim: true }, // for service/promotion (FB, IG, etc.)

    // Platform targets (for campaigns & boosts)
    platformTargets: [
      {
        type: String,
        enum: ["facebook", "instagram", "tiktok"],
      },
    ],

    // Analytics
    clicks: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },

    // Moderation and status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Type-specific flag for admin clarity
    listingType: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual", // TikTok will later become "automatic"
    },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);