const router = require("express").Router();
const Post = require("../models/Post");
const { protect, adminOnly } = require("../middleware/auth");
router.get("/", protect, async (req, res, next) => {
  try { res.json(await Post.find().populate("author", "name department").populate("comments.author", "name").sort({ createdAt: -1 })); } catch(e) { next(e); }
});
router.post("/", protect, async (req, res, next) => {
  try { const post = await Post.create({ title: req.body.title, body: req.body.body, tags: req.body.tags || [], author: req.user.id }); res.status(201).json(await post.populate("author", "name")); } catch(e) { next(e); }
});
router.post("/:id/like", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id); if (!post) return res.status(404).json({ message: "Post not found" });
    const idx = post.likes.findIndex(id => id.equals(req.user.id));
    if (idx >= 0) post.likes.splice(idx, 1); else post.likes.push(req.user.id);
    await post.save(); res.json({ likes: post.likes.length, liked: idx < 0 });
  } catch(e) { next(e); }
});
router.post("/:id/comments", protect, async (req, res, next) => {
  try {
    const text = String(req.body.text || "").trim(); if (!text) return res.status(400).json({ message: "Comment cannot be empty" });
    const post = await Post.findById(req.params.id); if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ text, author: req.user.id }); await post.save();
    res.json(await post.populate("comments.author", "name"));
  } catch(e) { next(e); }
});
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id); if (!post) return res.status(404).json({ message: "Post not found" });
    if (req.user.role !== "admin" && !post.author.equals(req.user.id)) return res.status(403).json({ message: "Not allowed" });
    await post.deleteOne(); res.json({ message: "Post deleted" });
  } catch(e) { next(e); }
});
module.exports = router;
