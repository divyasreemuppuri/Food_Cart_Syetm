import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin created");
    }

    // Check if staff already exists
    const staffExists = await User.findOne({ email: "staff@example.com" });
    if (!staffExists) {
      const hashedStaffPassword = await bcrypt.hash("staff123", 10);
      await User.create({
        name: "Staff User",
        email: "staff@example.com",
        password: hashedStaffPassword,
        role: "staff",
      });
      console.log("Staff created");
    }

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
};

seedUsers();
