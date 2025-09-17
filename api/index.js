// Main API handler for all routes
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
});

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://excel-analytics-platform.vercel.app',
    'https://your-frontend-netlify-url.netlify.app', // Replace with your Netlify frontend URL
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    environment: process.env.NODE_ENV 
  });
});

// Import and use backend routes
try {
  app.use('/api/auth', require('../backend/routes/auth'));
  app.use('/api/upload', require('../backend/routes/upload'));
  app.use('/api/files', require('../backend/routes/files').router);
  app.use('/api/data', require('../backend/routes/data'));
  app.use('/api/dashboard', require('../backend/routes/dashboard'));
  app.use('/api/admin', require('../backend/routes/admin'));
  app.use('/api/insights', require('../backend/routes/insights'));
} catch (error) {
  console.error('Error loading routes:', error);
}

module.exports = app;
