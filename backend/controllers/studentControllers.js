import User from "../models/User.js"; 
import Order from "../models/Order.js";

// Get Student Profile (excluding password)
export const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select("-password")
      .lean();

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Wallet Balance
export const getWalletBalance = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ walletBalance: student.walletBalance });
  } catch (error) {
    console.error("Wallet Fetch Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Orders Placed by Student
export const getStudentOrders = async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.params.studentId });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
