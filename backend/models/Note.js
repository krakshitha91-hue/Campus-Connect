const mongoose = require("mongoose");
module.exports = mongoose.model("Note", new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  semester: { type: Number, min: 1, max: 12 },
  description: { type: String, default: "" },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true }));
