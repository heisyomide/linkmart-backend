// models/serviceModel.js
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      enum: ["Tiktok", "Instagram", "Facebook", "Youtube", "X", "Whatsapp"],
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "running", "completed"],
      default: "pending",
    },
    adminNote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Create index for faster admin queries
serviceSchema.index({ status: 1, platform: 1 });

const Service = mongoose.model("Service", serviceSchema);

export default Service;