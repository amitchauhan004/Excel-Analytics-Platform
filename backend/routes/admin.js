const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");
const FileMeta = require("../models/FileMeta");
const DataRow = require("../models/DataRow");
const path = require("path");
const fs = require("fs");
const { deleteUserCompletely, getUserDeletionStats } = require("../utils/userDeletion");

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// @route   GET api/admin/users/:id
// @desc    Get user details
// @access  Private/Admin
router.get("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    // Get user's files
    const userFiles = await FileMeta.find({ uploadedBy: req.params.id });
    const totalStorageUsed = userFiles.reduce((sum, file) => sum + (file.fileSize || 0), 0);
    
    const userDetails = {
      user,
      filesUploaded: userFiles.length,
      totalStorageUsed,
      lastLogin: user.lastLogin || new Date(),
      accountStatus: "Active",
      joinDate: user.createdAt
    };
    
    res.json(userDetails);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// @route   PUT api/admin/users/:id
// @desc    Update user role
// @access  Private/Admin
router.put("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// @route   GET api/admin/users/:id/stats
// @desc    Get user deletion statistics
// @access  Private/Admin
router.get("/users/:id/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await getUserDeletionStats(req.params.id);
    if (stats.error) {
      return res.status(404).json({ msg: stats.error });
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to get user statistics" });
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user and all associated data
// @access  Private/Admin
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Use the comprehensive deletion utility
    const results = await deleteUserCompletely(userId, "Admin deletion");
    
    if (!results.success) {
      return res.status(500).json({ 
        msg: "Failed to delete user",
        errors: results.errors
      });
    }

    res.json({ 
      msg: "User and all associated data deleted successfully",
      details: results
    });

  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ msg: "Server error during user deletion" });
  }
});

// @route   GET api/admin/stats
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: "admin" });
    const regularUsers = totalUsers - adminUsers;
    
    const totalFiles = await FileMeta.countDocuments();
    const totalStorage = await FileMeta.aggregate([
      { $group: { _id: null, total: { $sum: "$fileSize" } } }
    ]);
    
    const recentUploads = await FileMeta.countDocuments({
      uploadedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const stats = {
      totalUsers,
      adminUsers,
      regularUsers,
      totalFiles,
      totalStorage: totalStorage[0]?.total || 0,
      recentUploads,
      activeUsers: Math.floor(totalUsers * 0.7), // Simulate active users
      systemHealth: "Good"
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;