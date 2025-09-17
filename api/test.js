// Simple test endpoint
module.exports = (req, res) => {
  res.status(200).json({ 
    message: "API is working!", 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
};
