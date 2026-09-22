const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/excel_analytics');
    console.log('Connected to MongoDB for seeding admin...');

    // Update configured notification email to admin role if exists
    if (process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER) {
      const targetEmail = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER;
      await User.updateOne({ email: targetEmail }, { role: 'admin' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@xcelflow.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Ensure default admin exists
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
      { upsert: true, new: true }
    );

    console.log('Admin account ready:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
