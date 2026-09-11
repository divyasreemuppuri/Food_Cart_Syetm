import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const resetOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Drop the orders collection
    await mongoose.connection.db.collection('orders').drop();
    console.log("✅ Dropped orders collection");

    // Recreate indexes for the Order model
    const Order = (await import("./models/Order.js")).default;
    
    // This will recreate the collection with proper indexes
    await Order.createCollection();
    console.log("✅ Recreated orders collection with correct schema");

  } catch (error) {
    // If collection doesn't exist, just continue
    if (error.code === 26) {
      console.log("✅ Orders collection didn't exist, creating new one");
      const Order = (await import("./models/Order.js")).default;
      await Order.createCollection();
    } else {
      console.error("Error:", error);
    }
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

resetOrders();