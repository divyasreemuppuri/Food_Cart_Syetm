// routes/menuRoutes.js
import express from "express";
import { getMenuItems, getMenuItemById } from "../controllers/menuController.js";

const router = express.Router();

// GET /api/menu - Get all menu items
router.get("/menu", getMenuItems);

// GET /api/menu/:id - Get menu item by ID
router.get("/menu/:id", getMenuItemById);

export default router;