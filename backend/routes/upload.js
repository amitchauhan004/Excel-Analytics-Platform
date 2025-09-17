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

    // Read the uploaded Excel file
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    const rowCount = jsonData.length;

    // Save file metadata to database
    const fileMeta = await FileMeta.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      uploadedBy: userId, // Use current user ID
      uploadedAt: new Date(),
      rowCount,
      downloadUrl: `/api/files/download/${req.file.filename}`, // Fix download URL
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
  const filePath = path.join(__dirname, "../uploads", filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

module.exports = router;
