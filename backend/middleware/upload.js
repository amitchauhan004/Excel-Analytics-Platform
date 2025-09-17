const multer = require("multer");
const path = require("path");

// For serverless environments, use memory storage instead of disk storage
const storage = process.env.NODE_ENV === 'production' 
  ? multer.memoryStorage() // Use memory storage in production (serverless)
  : multer.diskStorage({   // Use disk storage in development
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads/"));
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    // Allowed file extensions and MIME types
    const fileTypes = /xls|xlsx/; // Excel file extensions
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase()); // Check file extension
    const mimeType = file.mimetype === "application/vnd.ms-excel" || file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // Check MIME type

    if (extName && mimeType) {
      cb(null, true); // File is valid
    } else {
      cb(new Error("Only Excel files are allowed")); // File is invalid
    }
  },
});

module.exports = upload;
