const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const uploadRoutes = require("./routes/upload"); // Import upload route

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Api-Version");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Smart MongoDB connection middleware with auto-fallback for local Windows DNS SRV issues
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  let uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/excel_analytics";

  if (!process.env.VERCEL) {
    // Local environment: Attempt cloud URI if provided, fallback seamlessly to local database if DNS SRV is refused by local ISP
    try {
      if (uri.startsWith("mongodb+srv://")) {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
        isConnected = true;
        console.log("MongoDB connected: Cloud Database (Atlas)");
        return;
      }
    } catch (srvErr) {
      console.warn("⚠️ Cloud SRV DNS lookup failed locally. Auto-switching to Local MongoDB...");
      uri = "mongodb://127.0.0.1:27017/excel_analytics";
    }
  } else if (process.env.VERCEL && uri.includes("localhost")) {
    console.error("⚠️ MONGO_URI is pointing to localhost on Vercel. Please set MongoDB Atlas cloud URI in Vercel settings.");
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log("MongoDB connected:", uri.includes("127.0.0.1") || uri.includes("localhost") ? "Local Database" : "Cloud Database");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

// Connect DB middleware for serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("connectDB middleware error:", err);
  }
  next();
});

// Root / Health check route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "XcelFlow API Server is running" });
});

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
app.use("/api/contact", require("./routes/contact"));
app.use("/api/workflow", require("./routes/workflow"));
app.use("/api/health", require("./routes/health"));
app.use("/api/explain", require("./routes/explain"));
app.use("/api/story", require("./routes/story"));
// 404 Fallback for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

// Local server listen (non-Vercel environment)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export app for Vercel Serverless Functions
module.exports = app;