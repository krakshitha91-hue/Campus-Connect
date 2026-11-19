const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  department: { type: String, default: "" },
  year: { type: Number, min: 1, max: 6 },
  bio: { type: String, default: "", maxlength: 300 },
  role: { type: String, enum: ["student", "admin"], default: "student" }
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
