require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDatabase = require('./config/database');
const receiptRoutes = require('./routes/receipt');
const analyticsRoutes = require('./routes/analytics');
const budgetRoutes = require('./routes/budget');

// Verify API key is loaded
console.log('Hugging Face API Key loaded:', process.env.HUGGINGFACE_API_KEY ? 'Yes' : 'No');

const app = express();
const port = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDatabase();

// Routes
app.use('/api', receiptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budget', budgetRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File size is too large. Max limit is 5MB'
    });
  }
  res.status(500).json({ error: error.message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});