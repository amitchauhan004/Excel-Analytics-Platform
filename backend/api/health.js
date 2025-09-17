// Simple health check endpoint
module.exports = (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    message: "Health check successful"
  });
};
