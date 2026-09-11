import User from "../models/User.js";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";
import { walletEmailTemplate } from "../utils/walletEmailTemplate.js";

export const updateWalletBalance = async (req, res) => {
  try {
    const { amount, operation, reason } = req.body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (operation === "add") {
      user.walletBalance += parsedAmount;
    } else if (operation === "subtract" || operation === "deduct") {
      if (user.walletBalance < parsedAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      user.walletBalance -= parsedAmount;
    } else {
      return res.status(400).json({ message: "Invalid operation" });
    }

    await user.save(); // <-- DB updated

    // Prepare email
    const { subject, html, text } = walletEmailTemplate({
      name: user.name,
      amount: parsedAmount,
      operation,
      newBalance: user.walletBalance,
      reason,
    });

    try {
      // send email and wait for it
      await sendEmail({ to: user.email, subject, html, text });
    } catch (emailErr) {
      // If email fails, we still respond success for DB update but include warning.
      console.error("Email sending failed after wallet update:", emailErr);
      return res.status(200).json({
        message: "Wallet updated but failed to send email. Check server logs.",
        newBalance: user.walletBalance
      });
    }

    // Success response
    return res.status(200).json({
      message: `Wallet ${operation === "add" ? "credited" : "debited"} and email sent to ${user.email}`,
      newBalance: user.walletBalance
    });
  } catch (err) {
    console.error("Update Wallet Error:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};

// Get all users (students)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role = "student" } = req.query;
    
    const users = await User.find({ role })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role });

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Also delete all orders by this user
    await Order.deleteMany({ studentId: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};


// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, orderType, date } = req.query;
    
    let query = {};
    
    if (orderType && ["breakfast", "lunch", "dinner"].includes(orderType)) {
      query.orderType = orderType;
    }
    
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.orderDate = {
        $gte: targetDate,
        $lt: nextDay
      };
    }

    const orders = await Order.find(query)
      .populate("studentId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get orders by student
export const getOrdersByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ studentId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments({ studentId });

    res.status(200).json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Get Student Orders Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get daily orders summary
export const getDailyOrdersSummary = async (req, res) => {
  try {
    const { date } = req.query;
    let targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const orders = await Order.find({
      orderDate: {
        $gte: targetDate,
        $lt: nextDay
      }
    }).populate("studentId", "name email");

    // Group by order type
    const ordersByType = {
      breakfast: orders.filter(order => order.orderType === "breakfast"),
      lunch: orders.filter(order => order.orderType === "lunch"),
      dinner: orders.filter(order => order.orderType === "dinner")
    };

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Group by student
    const studentOrders = {};
    orders.forEach(order => {
      const studentId = order.studentId._id;
      if (!studentOrders[studentId]) {
        studentOrders[studentId] = {
          student: order.studentId,
          orders: [],
          totalSpent: 0
        };
      }
      studentOrders[studentId].orders.push(order);
      studentOrders[studentId].totalSpent += order.totalAmount;
    });

    res.status(200).json({
      date: targetDate.toISOString().split('T')[0],
      summary: {
        totalOrders,
        totalRevenue,
        breakfast: ordersByType.breakfast.length,
        lunch: ordersByType.lunch.length,
        dinner: ordersByType.dinner.length
      },
      ordersByType,
      studentOrders: Object.values(studentOrders),
      allOrders: orders
    });
  } catch (error) {
    console.error("Get Daily Summary Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Menu Management
export const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
    res.status(200).json(menuItems);
  } catch (error) {
    console.error("Get Menu Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const addMenuItem = async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body;

    if (!name || !price || !category || !imageUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const menuItem = new MenuItem({
      name,
      price: parseFloat(price),
      category,
      imageUrl
    });

    await menuItem.save();

    res.status(201).json({
      message: "Menu item added successfully",
      menuItem
    });
  } catch (error) {
    console.error("Add Menu Item Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (name) menuItem.name = name;
    if (price) menuItem.price = parseFloat(price);
    if (category) menuItem.category = category;
    if (imageUrl) menuItem.imageUrl = imageUrl;

    await menuItem.save();

    res.status(200).json({
      message: "Menu item updated successfully",
      menuItem
    });
  } catch (error) {
    console.error("Update Menu Item Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Delete Menu Item Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayOrders = await Order.find({
      orderDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const totalStudents = await User.countDocuments({ role: "student" });
    const totalMenuItems = await MenuItem.countDocuments();
    const totalOrders = await Order.countDocuments();

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // Weekly stats
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyOrders = await Order.find({
      orderDate: {
        $gte: weekAgo,
        $lt: tomorrow
      }
    });

    const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Order type breakdown for today
    const orderTypeBreakdown = {
      breakfast: todayOrders.filter(order => order.orderType === "breakfast").length,
      lunch: todayOrders.filter(order => order.orderType === "lunch").length,
      dinner: todayOrders.filter(order => order.orderType === "dinner").length
    };

    res.status(200).json({
      stats: {
        totalStudents,
        totalMenuItems,
        totalOrders,
        todayOrders: todayOrders.length,
        todayRevenue,
        totalRevenue: totalRevenue[0]?.total || 0,
        weeklyRevenue
      },
      orderTypeBreakdown
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};