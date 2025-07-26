const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String }, // Path to profile picture
  role: { type: String, default: "user" }, // "user" or "admin"
});

module.exports = mongoose.model("User", userSchema);