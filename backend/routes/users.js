const router = require("express").Router();
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");
router.get("/stats", protect, adminOnly, async (req, res, next) => {
  try {
    const [users, notes, posts, events] = await Promise.all([
      User.countDocuments(), require("../models/Note").countDocuments(),
      require("../models/Post").countDocuments(), require("../models/Event").countDocuments()
    ]);
    res.json({ users, notes, posts, events });
  } catch(e) { next(e); }
});
router.get("/", protect, adminOnly, async (req, res, next) => {
  try { res.json(await User.find().select("-password").sort({ createdAt: -1 })); } catch(e) { next(e); }
});
module.exports = router;
