const router = require("express").Router();
const DataRow = require("../models/DataRow");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Get the latest uploaded file's data for the current user
    const latestData = await DataRow.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to 100 rows for performance
    
    // Format data for frontend analysis
    const formattedData = latestData.map(row => row.data);
    
    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get data for a specific file
router.get("/file/:fileId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const fileData = await DataRow.find({ 
      fileId: req.params.fileId,
      uploadedBy: userId 
    }).sort({ rowIndex: 1 });
    
    const formattedData = fileData.map(row => row.data);
    
    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching file data:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
