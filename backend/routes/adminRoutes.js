import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateWalletBalance,
  getAllOrders,
  getOrdersByStudent,
  getDailyOrdersSummary,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getDashboardStats
} from "../controllers/adminController.js";

const router = express.Router();

// User Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/wallet", updateWalletBalance);

// Order Management
router.get("/orders", getAllOrders);
router.get("/orders/student/:studentId", getOrdersByStudent);
router.get("/orders/daily-summary", getDailyOrdersSummary);

// Menu Management
router.get("/menu", getMenuItems);
router.post("/menu", addMenuItem);
router.put("/menu/:id", updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);

// Dashboard Stats
router.get("/stats", getDashboardStats);

export default router;