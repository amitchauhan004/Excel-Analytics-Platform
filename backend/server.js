const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const uploadRoutes = require("./routes/upload"); // Import upload route

const app = express();

const allowedOrigin = process.env.CLIENT_URL || true;
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/upload", uploadRoutes); // Add this line to register the upload route
app.use("/api/files", require("./routes/files").router); // Add files route
app.use("/api/data", require("./routes/data")); // Add data route
app.use("/api/dashboard", require("./routes/dashboard")); // Add dashboard route
app.use("/api/admin", require("./routes/admin")); // Add admin route
app.use("/api/insights", require("./routes/insights")); // Add insights route
app.use("/api/ai", require("./routes/ai")); // Add AI route for data analysis
app.use("/api/simulate", require("./routes/simulate")); // Add Simulation route
app.use("/api/agent", require("./routes/agent")); // Add Autonomous Agent route
app.use("/api/forecast", require("./routes/forecast")); // Add Predictive Forecast route
app.use("/api/multilink", require("./routes/multilink")); // Add Multi-Link route

// Advanced Intelligence Routes
app.use("/api/workflow", require("./routes/workflow"));
app.use("/api/health", require("./routes/health"));
app.use("/api/explain", require("./routes/explain"));
app.use("/api/story", require("./routes/story"));
app.use("/api/contact", require("./routes/contact")); // Add Contact Form route





mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));