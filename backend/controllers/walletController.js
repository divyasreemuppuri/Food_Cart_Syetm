import User from "../models/User.js";
import nodemailer from "nodemailer";

const otpStore = {}; // temporary store

// ---------------- SEND OTP ----------------
export const sendWalletOTP = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId);

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[studentId] = { otp, expiry: Date.now() + 2 * 60 * 1000 }; // 2 min expiry

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: "Your Wallet Access OTP",
      text: `Your 6-digit OTP is ${otp}. It will expire in 2 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ---------------- VERIFY OTP ----------------
export const verifyWalletOTP = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { enteredOtp } = req.body;

    const record = otpStore[studentId];
    if (!record) return res.status(400).json({ message: "OTP not generated" });
    if (Date.now() > record.expiry)
      return res.status(400).json({ message: "OTP expired" });
    if (record.otp !== enteredOtp)
      return res.status(400).json({ message: "Invalid OTP" });

    // success - delete OTP
    delete otpStore[studentId];

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

export const addMoneyToWallet = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { amount } = req.body;

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.walletBalance += amount;
    await student.save();

    res.json({ walletBalance: student.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add money" });
  }
};
