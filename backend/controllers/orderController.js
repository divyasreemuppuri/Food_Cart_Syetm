// backend/controllers/orderController.js
import Order from "../models/Order.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// 🟢 Create new order
export const createOrder = async (req, res) => {
  try {
    const { studentId, items, orderType } = req.body;

    const totalAmount = items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);

    // just create order, don't deduct yet
    const newOrder = new Order({
      studentId,
      items,
      totalAmount,
      orderType,
      status: "pending", // payment not done yet
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully. Awaiting payment via QR scan.",
      order: newOrder,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: "Order creation failed." });
  }
};

// export const scanOrderAndDeduct = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await Order.findOne(orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     if (order.status === "paid") {
//       return res.status(400).json({ message: "Order already paid!" });
//     }

//     const student = await Student.findById(order.studentId);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     if (student.walletBalance < order.amount) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     // Deduct wallet
//     student.walletBalance -= order.amount;
//     await student.save();

//     // Update order
//     order.status = "paid";
//     order.paymentTime = new Date();
//     await order.save();

//     res.json({
//       success: true,
//       message: "Payment successful",
//       studentBalance: student.walletBalance,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const scanOrderAndDeduct = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1️⃣ Find the order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found!" });

    // 2️⃣ Find the student
    const student = await User.findById(order.studentId);
    if (!student) return res.status(404).json({ message: "Student not found!" });

    // 3️⃣ Check if already processed
    if (order.status === "completed") {
      return res.status(400).json({ message: "Payment already deducted!" });
    }

    // 4️⃣ Check balance
    if (student.walletBalance < order.totalAmount) {
      return res.status(400).json({ message: "Insufficient balance!" });
    }

    // 5️⃣ Deduct wallet & update order
    student.walletBalance -= order.totalAmount;
    order.status = "completed"; // ✅ mark order completed after payment

    await student.save();
    await order.save();

    res.json({
      message: `✅ Payment of ₹${order.totalAmount} deducted successfully!`,
      newBalance: student.walletBalance,
      orderStatus: order.status,
    });
  } catch (err) {
    console.error("Scan Order Deduct Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// Verify QR and Deduct Wallet
export const verifyPayment = async (req, res) => {
  try {
    const { studentId, orderId, amount } = req.body;

    const student = await Student.findById(studentId);
    const order = await Order.findById(orderId);

    if (!student || !order) {
      return res.status(404).json({ success: false, message: "Student or order not found" });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    if (student.wallet < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Deduct wallet
    student.wallet -= amount;
    await student.save();

    // Mark order as paid
    order.isPaid = true;
    await order.save();

    return res.json({ success: true, message: "Payment successful", wallet: student.wallet });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// 🟡 Get today's orders of a student
export const getStudentTodaysOrders = async (req, res) => {
  try {
    const { studentId } = req.params;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      studentId,
      createdAt: { $gte: start, $lte: end },
    })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      date: start.toISOString().split("T")[0],
      orders,
      count: orders.length,
    });
  } catch (err) {
    console.error("Today's orders error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🟣 Get all orders of a student (with pagination/filter)
export const getStudentOrders = async (req, res) => {
  try {
    const { studentId } = req.params;
    const orders = await Order.find({ studentId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔵 NEW: Get all orders grouped by date (for student profile)
export const getAllOrdersGroupedByDate = async (req, res) => {
  try {
    const { studentId } = req.params;

    const orders = await Order.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          orders: { $push: "$$ROOT" },
        },
      },
      { $sort: { "_id": -1 } },
    ]);

    res.status(200).json(orders);
  } catch (err) {
    console.error("Grouped orders error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🟠 Admin: Get daily orders
export const getDailyOrders = async (req, res) => {
  try {
    const dateParam = req.params.date || new Date().toISOString().split("T")[0];
    const target = new Date(dateParam);
    target.setHours(0, 0, 0, 0);
    const nextDay = new Date(target);
    nextDay.setDate(target.getDate() + 1);

    const orders = await Order.find({
      createdAt: { $gte: target, $lt: nextDay },
    })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ date: dateParam, orders, count: orders.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

