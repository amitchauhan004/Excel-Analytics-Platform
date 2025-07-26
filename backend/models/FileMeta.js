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
  downloadUrl: String,
});

module.exports = mongoose.model("FileMeta", fileMetaSchema);
