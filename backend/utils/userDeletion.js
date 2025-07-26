const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const FileMeta = require("../models/FileMeta");
const DataRow = require("../models/DataRow");

/**
 * Comprehensive user deletion utility
 * Deletes user account and all associated data including files and database records
 * @param {string} userId - The user ID to delete
 * @param {string} reason - Reason for deletion (for logging)
 * @returns {Object} - Deletion results and statistics
 */
const deleteUserCompletely = async (userId, reason = "User deletion") => {
  const results = {
    success: false,
    user: null,
    filesDeleted: 0,
    dataRowsDeleted: 0,
    storageFreed: 0,
    fileMetadataDeleted: 0,
    profilePicDeleted: false,
    errors: [],
    warnings: []
  };

  try {
    console.log(`Starting complete deletion for user ${userId} - Reason: ${reason}`);

    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      results.errors.push("User not found");
      return results;
    }

    results.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log(`Deleting user: ${user.name} (${user.email})`);

    // 1. Delete user's profile picture
    if (user.profilePic) {
      const profilePicPath = path.join(__dirname, "../", user.profilePic);
      if (fs.existsSync(profilePicPath)) {
        try {
          fs.unlinkSync(profilePicPath);
          results.profilePicDeleted = true;
          console.log(`Deleted profile picture: ${profilePicPath}`);
        } catch (error) {
          results.warnings.push(`Failed to delete profile picture: ${error.message}`);
          console.error(`Error deleting profile picture: ${error.message}`);
        }
      } else {
        results.warnings.push("Profile picture file not found in storage");
      }
    }

    // 2. Get all files uploaded by this user
    const userFiles = await FileMeta.find({ uploadedBy: userId });
    console.log(`Found ${userFiles.length} files uploaded by user ${userId}`);

    // 3. Delete all data rows and files associated with user's files
    for (const file of userFiles) {
      try {
        // Delete all data rows associated with this file
        const dataRowsDeleted = await DataRow.deleteMany({ fileId: file._id });
        results.dataRowsDeleted += dataRowsDeleted.deletedCount;
        
        // Delete the actual file from storage
        const filePath = path.join(__dirname, "../uploads", file.storedName);
        if (fs.existsSync(filePath)) {
          try {
            const fileStats = fs.statSync(filePath);
            results.storageFreed += fileStats.size;
            fs.unlinkSync(filePath);
            results.filesDeleted++;
            console.log(`Deleted file from storage: ${file.storedName}`);
          } catch (fileError) {
            results.warnings.push(`Failed to delete file ${file.storedName}: ${fileError.message}`);
            console.error(`Error deleting file from storage ${file.storedName}: ${fileError.message}`);
          }
        } else {
          results.warnings.push(`File not found in storage: ${filePath}`);
          console.log(`File not found in storage: ${filePath}`);
        }
      } catch (error) {
        results.errors.push(`Error processing file ${file._id}: ${error.message}`);
        console.error(`Error processing file ${file._id}: ${error.message}`);
      }
    }

    // 4. Delete all file metadata
    const fileMetaDeleted = await FileMeta.deleteMany({ uploadedBy: userId });
    results.fileMetadataDeleted = fileMetaDeleted.deletedCount;
    console.log(`Deleted ${fileMetaDeleted.deletedCount} file metadata records`);

    // 5. Delete all data rows that might be directly associated with the user
    const directDataRowsDeleted = await DataRow.deleteMany({ uploadedBy: userId });
    results.dataRowsDeleted += directDataRowsDeleted.deletedCount;
    console.log(`Deleted ${directDataRowsDeleted.deletedCount} additional data rows directly associated with user`);

    // 6. Finally, delete the user account
    await User.findByIdAndDelete(userId);
    console.log(`User account deleted: ${user.name} (${user.email})`);

    // 7. Run cleanup to remove any orphaned files
    try {
      const { cleanupOrphanedFiles } = require("../routes/files");
      if (typeof cleanupOrphanedFiles === 'function') {
        await cleanupOrphanedFiles();
        console.log("Orphaned files cleanup completed");
      }
    } catch (cleanupError) {
      results.warnings.push(`Cleanup function failed: ${cleanupError.message}`);
      console.log("Cleanup function not available or failed:", cleanupError.message);
    }

    results.success = true;
    console.log(`User deletion completed successfully for ${user.name}`);

  } catch (err) {
    results.errors.push(`Server error: ${err.message}`);
    console.error("Error in complete user deletion:", err);
  }

  return results;
};

/**
 * Get user deletion statistics before deletion
 * @param {string} userId - The user ID to analyze
 * @returns {Object} - User statistics
 */
const getUserDeletionStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: "User not found" };
    }

    const userFiles = await FileMeta.find({ uploadedBy: userId });
    const totalDataRows = await DataRow.countDocuments({ uploadedBy: userId });
    
    let totalStorageUsed = 0;
    for (const file of userFiles) {
      const filePath = path.join(__dirname, "../uploads", file.storedName);
      if (fs.existsSync(filePath)) {
        try {
          const fileStats = fs.statSync(filePath);
          totalStorageUsed += fileStats.size;
        } catch (error) {
          console.error(`Error getting file stats for ${file.storedName}: ${error.message}`);
        }
      }
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasProfilePic: !!user.profilePic
      },
      files: userFiles.length,
      dataRows: totalDataRows,
      storageUsed: totalStorageUsed,
      joinDate: user.createdAt
    };
  } catch (error) {
    console.error("Error getting user deletion stats:", error);
    return { error: "Failed to get user statistics" };
  }
};

module.exports = {
  deleteUserCompletely,
  getUserDeletionStats
}; 