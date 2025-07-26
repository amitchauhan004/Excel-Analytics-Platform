const express = require("express");
const router = express.Router();
const FileMeta = require("../models/FileMeta");
const DataRow = require("../models/DataRow");
const { authMiddleware } = require("../middleware/authMiddleware"); // Fix import

router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const fileCount = await FileMeta.countDocuments({ uploadedBy: userId });
    const rowCount = await DataRow.countDocuments({ uploadedBy: userId });
    const latestFiles = await FileMeta.find({ uploadedBy: userId }).sort({ uploadedAt: -1 }).limit(5);

    res.json({ fileCount, rowCount, latestFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

router.get("/history", authMiddleware, async (req, res) => {
  const { page = 1, limit = 10, type = "all", dateRange = "all" } = req.query; // Enhanced parameters
  const userId = req.user.id;
  try {
    let query = { uploadedBy: userId }; // Filter by current user
    
    // Filter by type
    if (type === "recent") {
      query.uploadedAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }; // Last 7 days
    } else if (type === "large") {
      query.rowCount = { $gte: 1000 }; // Files with 1000+ rows
    } else if (type === "small") {
      query.rowCount = { $lt: 100 }; // Files with less than 100 rows
    }
    
    // Filter by date range
    if (dateRange === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.uploadedAt = { $gte: today };
    } else if (dateRange === "week") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.uploadedAt = { $gte: weekAgo };
    } else if (dateRange === "month") {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.uploadedAt = { $gte: monthAgo };
    }

    const files = await FileMeta.find(query)
      .sort({ uploadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalFiles = await FileMeta.countDocuments(query);

    res.json({
      files,
      totalPages: Math.ceil(totalFiles / limit),
      currentPage: parseInt(page),
      totalFiles,
      type,
      dateRange
    });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get history statistics
router.get("/history/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const totalFiles = await FileMeta.countDocuments({ uploadedBy: userId });
    const todayFiles = await FileMeta.countDocuments({
      uploadedBy: userId,
      uploadedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    const weekFiles = await FileMeta.countDocuments({
      uploadedBy: userId,
      uploadedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const monthFiles = await FileMeta.countDocuments({
      uploadedBy: userId,
      uploadedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const largeFiles = await FileMeta.countDocuments({ uploadedBy: userId, rowCount: { $gte: 1000 } });
    const smallFiles = await FileMeta.countDocuments({ uploadedBy: userId, rowCount: { $lt: 100 } });
    const mediumFiles = await FileMeta.countDocuments({ 
      uploadedBy: userId,
      rowCount: { $gte: 100, $lt: 1000 } 
    });

    res.json({
      totalFiles,
      todayFiles,
      weekFiles,
      monthFiles,
      largeFiles,
      smallFiles,
      mediumFiles
    });
  } catch (err) {
    console.error("Error fetching history stats:", err);
    res.status(500).json({ error: "Failed to fetch history statistics" });
  }
});

// Get recent activity
router.get("/activity", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const recentFiles = await FileMeta.find({ uploadedBy: userId })
      .sort({ uploadedAt: -1 })
      .limit(10);

    const activities = recentFiles.map(file => ({
      id: file._id,
      message: `File "${file.originalName}" uploaded on ${new Date(file.uploadedAt).toLocaleDateString()}`,
      type: 'upload',
      timestamp: file.uploadedAt,
      fileId: file._id
    }));

    res.json(activities);
  } catch (err) {
    console.error("Error fetching recent activity:", err);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

router.get("/files", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await FileMeta.find({ uploadedBy: userId }).sort({ uploadedAt: -1 }).limit(5); // Fetch recent 5 files
    const totalFiles = await FileMeta.countDocuments({ uploadedBy: userId }); // Total files count
    const totalRows = await FileMeta.aggregate([
      { $match: { uploadedBy: userId } },
      { $group: { _id: null, totalRows: { $sum: "$rowCount" } } }
    ]);

    res.status(200).json({
      totalFiles,
      totalRows: totalRows[0]?.totalRows || 0,
      recentFiles: files,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

module.exports = router;
