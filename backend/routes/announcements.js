const router = require("express").Router();
const Announcement = require("../models/Announcement");
const { protect, adminOnly } = require("../middleware/auth");
router.get("/", protect, async (req, res, next) => {
  try { res.json(await Announcement.find().populate("author", "name").sort({ pinned: -1, createdAt: -1 })); } catch(e) { next(e); }
});
router.post("/", protect, adminOnly, async (req, res, next) => {
  try { const item = await Announcement.create({ ...req.body, author: req.user.id }); res.status(201).json(item); } catch(e) { next(e); }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try { await Announcement.findByIdAndDelete(req.params.id); res.json({ message: "Announcement deleted" }); } catch(e) { next(e); }
});
module.exports = router;
