const mongoose = require("mongoose");

const dataRowSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FileMeta",
    required: true,
  },
  rowIndex: {
    type: Number,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for query optimization
dataRowSchema.index({ fileId: 1, uploadedBy: 1, rowIndex: 1 });
dataRowSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model("DataRow", dataRowSchema);
