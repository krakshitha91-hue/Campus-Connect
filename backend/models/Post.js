const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 1000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Post", new mongoose.Schema({
  title: { type: String, required: true, maxlength: 140 },
  body: { type: String, required: true, maxlength: 5000 },
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [commentSchema]
}, { timestamps: true }));
