const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Note = require("../models/Note");
const { protect, adminOnly } = require("../middleware/auth");
const dir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(dir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, dir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_, file, cb) => {
  const ok = [".pdf", ".doc", ".docx", ".ppt", ".pptx"].includes(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error("Only PDF, DOC, DOCX, PPT and PPTX files are allowed"), ok);
}});
router.get("/", protect, async (req, res, next) => {
  try { res.json(await Note.find().populate("uploadedBy", "name").sort({ createdAt: -1 })); } catch(e) { next(e); }
});
router.post("/", protect, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please select a file" });
    const note = await Note.create({ title: req.body.title, subject: req.body.subject, semester: req.body.semester, description: req.body.description, fileName: req.file.originalname, fileUrl: `/uploads/${req.file.filename}`, uploadedBy: req.user.id });
    res.status(201).json(note);
  } catch(e) { next(e); }
});
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (req.user.role !== "admin" && !note.uploadedBy.equals(req.user.id)) return res.status(403).json({ message: "Not allowed" });
    const filePath = path.join(dir, path.basename(note.fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await note.deleteOne(); res.json({ message: "Note deleted" });
  } catch(e) { next(e); }
});
module.exports = router;
