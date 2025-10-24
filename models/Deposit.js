import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentGateway: { type: String, default: "Paystack" },
  },
  { timestamps: true }
);

export default mongoose.model("Deposit", depositSchema);