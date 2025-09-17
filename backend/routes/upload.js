const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const FileMeta = require("../models/FileMeta");
const DataRow = require("../models/DataRow");
const xlsx = require("xlsx"); // For reading Excel files
const fs = require("fs");
const path = require("path");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    console.log("Uploaded file:", req.file);
    const userId = req.user.id; // Get current user ID

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let workbook;
    
    // Handle both memory and disk storage
    if (req.file.buffer) {
      // Memory storage (production/serverless)
      workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    } else {
      // Disk storage (development)
      const filePath = req.file.path;
      workbook = xlsx.readFile(filePath);
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    const rowCount = jsonData.length;

    // Generate a unique filename for storage reference
    const storedName = req.file.buffer 
      ? `${Date.now()}-${req.file.originalname}` 
      : req.file.filename;

    // Save file metadata to database
    const fileMeta = await FileMeta.create({
      originalName: req.file.originalname,
      storedName: storedName,
      uploadedBy: userId, // Use current user ID
      uploadedAt: new Date(),
      rowCount,
      downloadUrl: `/api/files/download/${storedName}`, // Fix download URL
    });

    // Store Excel data in database for analysis
    if (jsonData.length > 0) {
      const dataRows = jsonData.map((row, index) => ({
        fileId: fileMeta._id,
        rowIndex: index,
        data: row,
        uploadedBy: userId, // Add user ID to data rows
      }));
      
      await DataRow.insertMany(dataRows);
    }

    res.status(201).json({ 
      message: "File uploaded successfully", 
      fileMeta,
      rowCount 
    });
  } catch (err) {
    console.error("Error during file upload:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Add download route
router.get("/download/:filename", authMiddleware, (req, res) => {
  const filename = req.params.filename;
  
  // In production/serverless, files are not stored locally
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      error: "File download not available in serverless environment. Files are processed and stored in database only." 
    });
  }
  
  // Development mode - check local file system
  const filePath = path.join(__dirname, "../uploads", filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

module.exports = router;
