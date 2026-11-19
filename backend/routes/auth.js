const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const issueToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
router.post("/register", [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    const { name, email, password, department, year } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email is already registered" });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, department, year });
    res.status(201).json({ token: issueToken(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, year: user.year } });
  } catch (e) { next(e); }
});
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: issueToken(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, year: user.year } });
  } catch (e) { next(e); }
});
router.get("/me", protect, (req, res) => res.json({ user: req.user }));
module.exports = router;
