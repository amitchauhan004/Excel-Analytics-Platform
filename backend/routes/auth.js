const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");
const axios = require("axios");
const { deleteUserCompletely } = require("../utils/userDeletion");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure multer to use memory storage instead of disk storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Register a new user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return the same response format as login
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic ? `/api/auth/profile-pic/${path.basename(user.profilePic)}` : null
      },
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // Include role in the response
        profilePic: user.profilePic ? `/api/auth/profile-pic/${path.basename(user.profilePic)}` : null
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Google Sign-Up/Sign-In
router.post("/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      // Register new user
      user = new User({ name, email, password: "" });
      await user.save();
    }

    const payload = { user: { id: user.id } };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic ? `/api/auth/profile-pic/${path.basename(user.profilePic)}` : null
      },
    });
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(500).json({ msg: "Google authentication failed" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ msg: "Failed to send password reset link" });
  }
});

// Serve profile picture
router.get("/profile-pic/:filename", async (req, res) => {
  try {
    const user = await User.findOne({ "profilePic": { $regex: req.params.filename } });
    if (!user || !user.profilePic) {
      return res.status(404).json({ error: "Profile picture not found" });
    }
    res.redirect(user.profilePic);
  } catch (err) {
    console.error("Error serving profile picture:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user details
router.put("/update", authMiddleware, upload.single("profilePic"), async (req, res) => {
  const { name, password, removeProfilePic } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) user.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Handle profile picture
    if (req.file) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "profile-pics" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Create a buffer from the file
        uploadStream.end(req.file.buffer);
      });

      user.profilePic = result.secure_url;
    } else if (removeProfilePic) {
      // If user wants to remove profile picture
      if (user.profilePic) {
        // Extract public_id from Cloudinary URL if exists
        const publicId = user.profilePic.split("/").slice(-1)[0].split(".")[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting from Cloudinary:", error);
        }
      }
      user.profilePic = null;
    }

    await user.save();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete user account
router.delete("/delete-account", authMiddleware, async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password) {
    return res.status(400).json({ msg: "Password is required to delete account" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    // Use the comprehensive deletion utility
    const results = await deleteUserCompletely(userId, "Self deletion");
    
    if (!results.success) {
      return res.status(500).json({ 
        msg: "Failed to delete account",
        errors: results.errors
      });
    }

    res.json({ 
      msg: "Account deleted successfully",
      details: results
    });

  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ msg: "Failed to delete account" });
  }
});

// Load specific file data
router.get("/data/:fileId", async (req, res) => {
  const fileId = req.params.fileId;

  try {
    if (fileId) {
      const response = await axios.get(`http://localhost:5000/api/data/file/${fileId}`);
      res.json(response.data);
    } else {
      res.status(400).json({ msg: "File ID is required" });
    }
  } catch (err) {
    console.error("Error loading file data:", err);
    res.status(500).json({ msg: "Failed to load file data" });
  }
});

module.exports = router;