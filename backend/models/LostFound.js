const mongoose = require("mongoose");
module.exports = mongoose.model("LostFound", new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["Lost", "Found"], required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true }));
