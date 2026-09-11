import express from "express";
import {
  getMenuItems,
  getMenuItemById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuStats
} from "../controllers/staffController.js";

const router = express.Router();

// Menu Management - CRUD operations
router.get("/menu", getMenuItems);
router.get("/menu/:id", getMenuItemById);
router.post("/menu", addMenuItem);
router.put("/menu/:id", updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);

// Dashboard Stats
router.get("/stats", getMenuStats);

export default router;