const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number
});

const receiptSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  category: {
    type: String,
    required: true,
    enum: ['food', 'transportation', 'entertainment', 'shopping', 'utilities', 'healthcare', 'others']
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  // OCR extracted data
  merchant: String,
  date: Date,
  total: Number,
  items: [itemSchema],
  // Processing metadata
  rawText: String,
  confidence: Number,
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Receipt', receiptSchema); 