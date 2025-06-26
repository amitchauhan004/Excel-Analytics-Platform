const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const FileMeta = require("../models/FileMeta");
const DataRow = require("../models/DataRow");
const xlsx = require("xlsx"); // For reading Excel files
const { authMiddleware } = require("../middleware/authMiddleware");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    console.log("Processing file upload");
    const userId = req.user.id;

    // Read the Excel file from buffer
    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    const rowCount = jsonData.length;

    // Upload file to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "excel-files",
          resource_type: "raw",
          format: "xlsx"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Create a readable stream from buffer and pipe to Cloudinary
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });

    // Save file metadata to database
    const fileMeta = await FileMeta.create({
      originalName: req.file.originalname,
      storedName: uploadResult.public_id,
      uploadedBy: userId,
      uploadedAt: new Date(),
      rowCount,
      downloadUrl: uploadResult.secure_url,
    });

    // Store Excel data in database for analysis
    if (jsonData.length > 0) {
      const dataRows = jsonData.map((row, index) => ({
        fileId: fileMeta._id,
        rowIndex: index,
        data: row,
        uploadedBy: userId,
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

// Download route now redirects to Cloudinary URL
router.get("/download/:fileId", authMiddleware, async (req, res) => {
  try {
    const file = await FileMeta.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    
    // Redirect to Cloudinary download URL
    res.redirect(file.downloadUrl);
  } catch (err) {
    console.error("Error during file download:", err);
    res.status(500).json({ error: "Failed to download file" });
  }
});

module.exports = router;
