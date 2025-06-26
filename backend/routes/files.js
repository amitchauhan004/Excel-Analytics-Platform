const express = require("express");
const router = express.Router();
const FileMeta = require("../models/FileMeta");
const DataRow = require("../models/DataRow");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all uploaded files for the current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await FileMeta.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// Download a file by ID
router.get("/download/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const file = await FileMeta.findOne({ 
      _id: req.params.id,
      uploadedBy: userId
    });

    if (!file) {
      return res.status(404).json({ error: "File not found or access denied" });
    }

    // Redirect to Cloudinary URL
    res.redirect(file.downloadUrl);
  } catch (err) {
    console.error("Error downloading file:", err);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// Delete a file by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = req.params.id;
    
    console.log(`User ${userId} attempting to delete file ${fileId}`);
    
    // Find the file first to get its details
    const file = await FileMeta.findOne({ 
      _id: fileId, 
      uploadedBy: userId 
    });
    
    if (!file) {
      console.log(`File ${fileId} not found or access denied for user ${userId}`);
      return res.status(404).json({ error: "File not found or access denied" });
    }
    
    console.log(`Found file: ${file.originalName} (${file.storedName})`);
    
    // Delete all data rows associated with this file
    const dataRowsDeleted = await DataRow.deleteMany({ 
      fileId: file._id,
      uploadedBy: userId 
    });
    
    console.log(`Deleted ${dataRowsDeleted.deletedCount} data rows for file ${fileId}`);
    
    // Delete the file from Cloudinary
    let fileDeleted = false;
    try {
      await cloudinary.uploader.destroy(file.storedName, { resource_type: "raw" });
      fileDeleted = true;
      console.log(`Successfully deleted file from Cloudinary: ${file.storedName}`);
    } catch (cloudinaryError) {
      console.error(`Error deleting file from Cloudinary: ${cloudinaryError.message}`);
    }
    
    // Delete the file metadata from database
    const fileMetaDeleted = await FileMeta.findOneAndDelete({ 
      _id: fileId, 
      uploadedBy: userId 
    });
    
    if (!fileMetaDeleted) {
      console.error(`Failed to delete file metadata for file ${fileId}`);
      return res.status(500).json({ error: "Failed to delete file metadata" });
    }
    
    console.log(`Successfully deleted file metadata for file ${fileId}`);
    
    // Return success response with details
    res.json({ 
      message: "File and associated data deleted successfully",
      details: {
        fileName: file.originalName,
        dataRowsDeleted: dataRowsDeleted.deletedCount,
        fileDeletedFromStorage: fileDeleted
      }
    });
    
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Bulk delete multiple files
router.delete("/bulk/delete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fileIds } = req.body;
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: "File IDs array is required" });
    }
    
    console.log(`User ${userId} attempting to delete ${fileIds.length} files`);
    
    const results = {
      success: true,
      totalProcessed: 0,
      successfulDeletes: 0,
      failedDeletes: 0,
      errors: []
    };
    
    for (const fileId of fileIds) {
      try {
        // Find and validate file
        const file = await FileMeta.findOne({ 
          _id: fileId, 
          uploadedBy: userId 
        });
        
        if (!file) {
          results.errors.push(`File ${fileId} not found or access denied`);
          results.failedDeletes++;
          continue;
        }
        
        // Delete data rows
        await DataRow.deleteMany({ 
          fileId: file._id,
          uploadedBy: userId 
        });
        
        // Delete from Cloudinary
        try {
          await cloudinary.uploader.destroy(file.storedName, { resource_type: "raw" });
        } catch (cloudinaryError) {
          console.error(`Error deleting file from Cloudinary: ${cloudinaryError.message}`);
        }
        
        // Delete metadata
        await FileMeta.findOneAndDelete({ 
          _id: fileId, 
          uploadedBy: userId 
        });
        
        results.successfulDeletes++;
        
      } catch (error) {
        results.errors.push(`Error processing file ${fileId}: ${error.message}`);
        results.failedDeletes++;
      }
      
      results.totalProcessed++;
    }
    
    res.json(results);
    
  } catch (err) {
    console.error("Error in bulk delete:", err);
    res.status(500).json({ 
      error: "Failed to process bulk delete",
      details: err.message
    });
  }
});

module.exports = {
  router,
  cleanupOrphanedFiles: async () => {
    // Cloudinary cleanup can be implemented here if needed
    return {
      success: true,
      message: "Cleanup not required with Cloudinary storage",
      filesDeleted: 0,
      errors: []
    };
  }
};
