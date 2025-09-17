const express = require("express");
const router = express.Router();
const FileMeta = require("../models/FileMeta");
const DataRow = require("../models/DataRow");
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");

// Utility function to clean up orphaned files
const cleanupOrphanedFiles = async () => {
  try {
    console.log("Starting orphaned files cleanup...");
    
    // Skip cleanup in production/serverless environment
    if (process.env.NODE_ENV === 'production') {
      console.log("Skipping file cleanup in production (serverless environment)");
      return {
        success: true,
        message: "File cleanup skipped in serverless environment",
        filesDeleted: 0,
        errors: []
      };
    }
    
    // Get all files in the uploads directory
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      console.log("Uploads directory does not exist");
      return {
        success: true,
        message: "Uploads directory does not exist",
        filesDeleted: 0,
        errors: []
      };
    }
    
    const filesInDir = fs.readdirSync(uploadsDir);
    console.log(`Found ${filesInDir.length} files in uploads directory`);
    
    // Get all stored file names from database
    const dbFiles = await FileMeta.find({}, 'storedName');
    const dbFileNames = dbFiles.map(f => f.storedName);
    
    // Find orphaned files (files in directory but not in database)
    const orphanedFiles = filesInDir.filter(fileName => !dbFileNames.includes(fileName));
    
    const results = {
      success: true,
      totalFilesInDirectory: filesInDir.length,
      totalFilesInDatabase: dbFileNames.length,
      orphanedFilesFound: orphanedFiles.length,
      filesDeleted: 0,
      errors: [],
      deletedFiles: []
    };
    
    if (orphanedFiles.length > 0) {
      console.log(`Found ${orphanedFiles.length} orphaned files:`, orphanedFiles);
      
      // Delete orphaned files
      for (const fileName of orphanedFiles) {
        const filePath = path.join(uploadsDir, fileName);
        try {
          const fileStats = fs.statSync(filePath);
          fs.unlinkSync(filePath);
          results.filesDeleted++;
          results.deletedFiles.push({
            name: fileName,
            size: fileStats.size,
            path: filePath
          });
          console.log(`Deleted orphaned file: ${fileName} (${fileStats.size} bytes)`);
        } catch (error) {
          const errorMsg = `Failed to delete orphaned file ${fileName}: ${error.message}`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
        }
      }
    } else {
      console.log("No orphaned files found");
    }
    
    console.log(`Cleanup completed: ${results.filesDeleted} files deleted, ${results.errors.length} errors`);
    return results;
    
  } catch (error) {
    console.error("Error during orphaned files cleanup:", error);
    return {
      success: false,
      message: "Error during cleanup process",
      error: error.message,
      filesDeleted: 0,
      errors: [error.message]
    };
  }
};

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

// Download a file by filename
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
    
    // Delete the actual file from storage (only in development)
    let fileDeleted = false;
    
    if (process.env.NODE_ENV !== 'production') {
      const filePath = path.join(__dirname, "../uploads", file.storedName);
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          fileDeleted = true;
          console.log(`Successfully deleted file from storage: ${filePath}`);
        } catch (fileError) {
          console.error(`Error deleting file from storage: ${fileError.message}`);
          // Continue with database deletion even if file deletion fails
        }
      } else {
        console.log(`File not found in storage: ${filePath}`);
      }
    } else {
      console.log("Skipping file deletion in production (serverless environment)");
      fileDeleted = true; // Consider it successful since files aren't stored locally
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
        fileDeletedFromStorage: fileDeleted,
        fileSize: file.fileSize
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
      successful: [],
      failed: [],
      totalDeleted: 0,
      totalDataRowsDeleted: 0
    };
    
    for (const fileId of fileIds) {
      try {
        // Find the file
        const file = await FileMeta.findOne({ 
          _id: fileId, 
          uploadedBy: userId 
        });
        
        if (!file) {
          results.failed.push({ fileId, reason: "File not found or access denied" });
          continue;
        }
        
        // Delete data rows
        const dataRowsDeleted = await DataRow.deleteMany({ 
          fileId: file._id,
          uploadedBy: userId 
        });
        
        // Delete file from storage (only in development)
        let fileDeleted = false;
        
        if (process.env.NODE_ENV !== 'production') {
          const filePath = path.join(__dirname, "../uploads", file.storedName);
          
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              fileDeleted = true;
            } catch (fileError) {
              console.error(`Error deleting file from storage: ${fileError.message}`);
            }
          }
        } else {
          fileDeleted = true; // Consider it successful in serverless environment
        }
        
        // Delete file metadata
        const fileMetaDeleted = await FileMeta.findOneAndDelete({ 
          _id: fileId, 
          uploadedBy: userId 
        });
        
        if (fileMetaDeleted) {
          results.successful.push({
            fileId,
            fileName: file.originalName,
            dataRowsDeleted: dataRowsDeleted.deletedCount,
            fileDeletedFromStorage: fileDeleted
          });
          results.totalDeleted++;
          results.totalDataRowsDeleted += dataRowsDeleted.deletedCount;
        } else {
          results.failed.push({ fileId, reason: "Failed to delete file metadata" });
        }
        
      } catch (error) {
        console.error(`Error deleting file ${fileId}:`, error);
        results.failed.push({ fileId, reason: error.message });
      }
    }
    
    console.log(`Bulk delete completed: ${results.totalDeleted} successful, ${results.failed.length} failed`);
    
    res.json({
      message: `Bulk delete completed`,
      results
    });
    
  } catch (err) {
    console.error("Error in bulk delete:", err);
    res.status(500).json({ error: "Failed to perform bulk delete" });
  }
});

// Cleanup orphaned files (admin only)
router.post("/cleanup", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin by fetching from database
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    console.log(`Admin ${user.name} (${user.email}) initiated orphaned files cleanup`);
    
    await cleanupOrphanedFiles();
    
    res.json({ 
      message: "Orphaned files cleanup completed successfully",
      cleanedBy: user.name,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Error during cleanup:", err);
    res.status(500).json({ error: "Failed to perform cleanup" });
  }
});

module.exports = {
  router,
  cleanupOrphanedFiles
};
