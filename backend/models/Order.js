import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
    default: "pending"
  },
  orderType: {
    type: String,
    enum: ["breakfast", "lunch", "dinner"],
    required: true
  },
    paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending"
  }
  // Completely remove orderNumber field to avoid issues
}, { timestamps: true });

// Index for better query performance
orderSchema.index({ studentId: 1, orderDate: 1 });
orderSchema.index({ orderDate: 1 });

export default mongoose.model("Order", orderSchema);