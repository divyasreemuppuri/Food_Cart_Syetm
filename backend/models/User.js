import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "staff", "admin"],
    default: "student",
  },
  walletBalance: { // ✅ ADD THIS FIELD
    type: Number,
    default: 0, // Default wallet balance
  },
}, { timestamps: true })

; // Automatically adds createdAt and updatedAt

export default mongoose.model("User", userSchema);
