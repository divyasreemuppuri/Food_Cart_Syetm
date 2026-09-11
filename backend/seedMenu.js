// seedMenu.js
import mongoose from "mongoose";
import MenuItem from "./models/MenuItem.js";
import dotenv from "dotenv";

// Load environment variables same as server.js
dotenv.config();

const seedMenu = async () => {
  try {
    // Use the same MongoDB connection as server.js
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    console.log("Database:", mongoose.connection.db.databaseName);

    // Check current count before clearing
    const beforeCount = await MenuItem.countDocuments();
    console.log(`📊 Menu items before seeding: ${beforeCount}`);

    // Clear existing menu items
    console.log("🧹 Clearing existing menu items...");
    const deleteResult = await MenuItem.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} menu items`);

    // Insert new menu items (removed duplicates)
   const items = [
  { 
    name: "Masala Dosa", 
    price: 80, 
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976",
    category: "breakfast"
  },
  { 
    name: "Veg Sandwich", 
    price: 45, 
    imageUrl: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586",
    category: "breakfast"
  },
  { 
    name: "Cold Coffee", 
    price: 40, 
    imageUrl: "https://images.unsplash.com/photo-1498804103079-a6351b050096",
    category: "breakfast"
  },
  { 
    name: "Chicken Biryani", 
    price: 150, 
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d96f",
    category: "lunch"
  },
  { 
    name: "Veg Burger", 
    price: 50, 
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349",
    category: "lunch"
  },
  { 
    name: "French Fries", 
    price: 60, 
    imageUrl: "https://images.unsplash.com/photo-1606813902594-d3e66c9151f2",
    category: "lunch"
  },
  { 
    name: "Cheese Pizza", 
    price: 120, 
    imageUrl: "https://images.unsplash.com/photo-1601924582971-d7330a5b32de",
    category: "dinner"
  },
  { 
    name: "Mango Shake", 
    price: 55, 
    imageUrl: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9",
    category: "dinner"
  },
];

    console.log("📝 Inserting menu items...");
    const result = await MenuItem.insertMany(items);
    console.log(`✅ ${result.length} menu items added successfully`);

    // Verify insertion
    const afterCount = await MenuItem.countDocuments();
    console.log(`📊 Menu items after seeding: ${afterCount}`);

    // Display inserted items
    const allItems = await MenuItem.find();
    console.log("📋 Inserted items:", allItems.map(item => item.name));

  } catch (error) {
    console.error("❌ Error seeding menu:", error);
    console.log("Make sure your .env file has MONGO_URI defined");
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Run the seed function
seedMenu();