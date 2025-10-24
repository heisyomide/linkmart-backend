import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    whatsapp: { type: String },
    platforms: [
      {
        type: String,
        enum: ["Tiktok", "Instagram", "Facebook", "Youtube", "X", "Whatsapp"],
      },
    ],
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "running", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);