const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminExists = await User.findOne({ email: "amit@khedla.com" });
    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin1234", salt);

    const admin = new User({
      name: "Admin",
      email: "amit@khedla.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error creating admin user:", err);
    mongoose.connection.close();
  }
};

createAdmin();