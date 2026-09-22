const mongoose = require("mongoose");

const fileMetaSchema = new mongoose.Schema({
  originalName: String,
  storedName: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  rowCount: Number,
  fileSize: {
    type: Number,
    default: 0,
  },
  downloadUrl: String,
});

// Indexes for fast lookup
fileMetaSchema.index({ uploadedBy: 1, uploadedAt: -1 });
fileMetaSchema.index({ storedName: 1 });

module.exports = mongoose.model("FileMeta", fileMetaSchema);
