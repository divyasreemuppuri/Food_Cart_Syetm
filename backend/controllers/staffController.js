import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";

// Get all menu items
export const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
    console.log("Fetched menu items:", menuItems.length);
    res.status(200).json(menuItems);
  } catch (error) {
    console.error("Get Menu Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json(menuItem);
  } catch (error) {
    console.error("Get Menu Item Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Add new menu item
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body;

    console.log("Adding menu item:", { name, price, category, imageUrl });

    // Validation
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

    console.log("Menu item added successfully:", menuItem._id);

    res.status(201).json({
      message: "Menu item added successfully!",
      menuItem
    });
  } catch (error) {
    console.error("Add Menu Item Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Update fields
    if (name) menuItem.name = name;
    if (price) menuItem.price = parseFloat(price);
    if (category) menuItem.category = category;
    if (imageUrl) menuItem.imageUrl = imageUrl;

    await menuItem.save();

    res.status(200).json({
      message: "Menu item updated successfully!",
      menuItem
    });
  } catch (error) {
    console.error("Update Menu Item Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      message: "Menu item deleted successfully!",
      deletedItem: menuItem
    });
  } catch (error) {
    console.error("Delete Menu Item Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get menu statistics
export const getMenuStats = async (req, res) => {
  try {
    const totalItems = await MenuItem.countDocuments();
    
    // Count items by category
    const breakfastCount = await MenuItem.countDocuments({ category: 'breakfast' });
    const lunchCount = await MenuItem.countDocuments({ category: 'lunch' });
    const dinnerCount = await MenuItem.countDocuments({ category: 'dinner' });

    // Get today's orders for popular items
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.find({
      orderDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Calculate popular items
    const popularItems = {};
    todayOrders.forEach(order => {
      order.items.forEach(item => {
        if (!popularItems[item.name]) {
          popularItems[item.name] = 0;
        }
        popularItems[item.name] += item.quantity || 1;
      });
    });

    // Convert to array and sort
    const popularItemsArray = Object.entries(popularItems)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      stats: {
        totalItems,
        categoryCounts: {
          breakfast: breakfastCount,
          lunch: lunchCount,
          dinner: dinnerCount
        },
        popularItems: popularItemsArray
      }
    });
  } catch (error) {
    console.error("Get Menu Stats Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};