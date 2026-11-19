const router = require("express").Router();
const LostFound = require("../models/LostFound");
const { protect, adminOnly } = require("../middleware/auth");
router.get("/", protect, async (req, res, next) => {
  try { res.json(await LostFound.find().populate("createdBy", "name").sort({ createdAt: -1 })); } catch(e) { next(e); }
});
router.post("/", protect, async (req, res, next) => {
  try { const item = await LostFound.create({ ...req.body, createdBy: req.user.id }); res.status(201).json(item); } catch(e) { next(e); }
});
router.patch("/:id/resolve", protect, async (req, res, next) => {
  try {
    const item = await LostFound.findById(req.params.id); if (!item) return res.status(404).json({ message: "Item not found" });
    if (req.user.role !== "admin" && !item.createdBy.equals(req.user.id)) return res.status(403).json({ message: "Not allowed" });
    item.status = "Resolved"; await item.save(); res.json(item);
  } catch(e) { next(e); }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try { await LostFound.findByIdAndDelete(req.params.id); res.json({ message: "Item deleted" }); } catch(e) { next(e); }
});
module.exports = router;
