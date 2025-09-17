const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const uploadRoutes = require("./routes/upload"); // Import upload route

const app = express();

// CORS configuration for production
const allowedOrigins = [
  "http://localhost:3000",
  "https://excel-analytics-platform.vercel.app", // Your backend URL
  "https://your-frontend-netlify-url.netlify.app", // Replace with your Netlify frontend URL
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins, 
  credentials: true 
}));
app.use(express.json());

// Serve static files from uploads directory (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// Register routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/upload", uploadRoutes); // Add this line to register the upload route
app.use("/api/files", require("./routes/files").router); // Add files route
app.use("/api/data", require("./routes/data")); // Add data route
app.use("/api/dashboard", require("./routes/dashboard")); // Add dashboard route
app.use("/api/admin", require("./routes/admin")); // Add admin route
app.use("/api/insights", require("./routes/insights")); // Add insights route

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", environment: process.env.NODE_ENV });
});

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI environment variable is not set");
      return;
    }
    
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Don't exit the process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel serverless functions
module.exports = app;