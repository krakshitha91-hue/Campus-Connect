const router = require("express").Router();
const Event = require("../models/Event");
const { protect, adminOnly } = require("../middleware/auth");
router.get("/", protect, async (req, res, next) => {
  try { res.json(await Event.find().populate("createdBy", "name").sort({ date: 1 })); } catch(e) { next(e); }
});
router.post("/", protect, adminOnly, async (req, res, next) => {
  try { const event = await Event.create({ ...req.body, createdBy: req.user.id }); res.status(201).json(event); } catch(e) { next(e); }
});
router.post("/:id/register", protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.attendees.some(id => id.equals(req.user.id))) return res.status(400).json({ message: "Already registered" });
    if (event.capacity > 0 && event.attendees.length >= event.capacity) return res.status(400).json({ message: "Event is full" });
    event.attendees.push(req.user.id); await event.save(); res.json(event);
  } catch(e) { next(e); }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try { await Event.findByIdAndDelete(req.params.id); res.json({ message: "Event deleted" }); } catch(e) { next(e); }
});
module.exports = router;
