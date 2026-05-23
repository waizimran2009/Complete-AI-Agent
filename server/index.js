require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public/
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api/ai",         require("./routes/ai"));
app.use("/api/email",      require("./routes/email"));
app.use("/api/calls",      require("./routes/calls"));
app.use("/api/posts",      require("./routes/posts"));
app.use("/api/ats",        require("./routes/ats"));
app.use("/api/interviews", require("./routes/interviews"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/leave",      require("./routes/leave"));
app.use("/api/analytics",  require("./routes/analytics"));
app.use("/api/employees",  require("./routes/employees"));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Complete AI Agent running at http://localhost:${PORT}`);
});
