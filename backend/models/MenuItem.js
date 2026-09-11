import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["breakfast", "lunch", "dinner"] // Restrict to these categories
  }
});

export default mongoose.model("MenuItem", menuItemSchema);