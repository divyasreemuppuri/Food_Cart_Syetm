// backend/routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getStudentOrders,
  getStudentTodaysOrders,
  getDailyOrders,
  getAllOrdersGroupedByDate, // 👈 NEW FUNCTION
} from "../controllers/orderController.js";

import { verifyPayment } from "../controllers/orderController.js";
import { scanOrderAndDeduct } from "../controllers/orderController.js";

const router = express.Router();

// Create a new order
router.post("/order", createOrder);

// Get today's orders for a student
router.get("/orders/today/:studentId", getStudentTodaysOrders);

// Get all orders for a student (paginated)
router.get("/orders/student/:studentId", getStudentOrders);

// Get all orders grouped by date (for profile/history view)
router.get("/orders/history/:studentId", getAllOrdersGroupedByDate);

// Get today's orders (for admin)
router.get("/orders/daily", getDailyOrders);

// Get specific date orders (for admin)
router.get("/orders/daily/:date", getDailyOrders);


router.get("/scan/:orderId", scanOrderAndDeduct);

router.post("/verify-payment", verifyPayment);

export default router;
