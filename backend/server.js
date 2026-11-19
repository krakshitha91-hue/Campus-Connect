require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const app = express();
const allowedOrigins = [
  "https://campus-connect-tjp8.vercel.app",
  "https://campus-connect-tjp8-git-main-fit-track18.vercel.app",
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_, res) => res.json({ status: "ok", app: "CampusConnect API" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/events", require("./routes/events"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/lost-found", require("./routes/lostFound"));
app.use("/api/users", require("./routes/users"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`CampusConnect API running on ${PORT}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
