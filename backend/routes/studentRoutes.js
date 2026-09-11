import express from "express";
import {
  getStudentProfile,
  getWalletBalance,
  getStudentOrders,
} from "../controllers/studentControllers.js";

const router = express.Router();

// GET /api/student/profile/:id
router.get("/profile/:id", getStudentProfile);

// GET /api/student/wallet/:id
router.get("/wallet/:id", getWalletBalance);

// GET /api/student/orders/:studentId
router.get("/orders/:studentId", getStudentOrders);

export default router;
