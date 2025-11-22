const Receipt = require('../models/Receipt');
const { processReceipt } = require('../services/receiptProcessor');

const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.body.category) {
      return res.status(400).json({ error: 'Receipt category is required' });
    }

    // Create initial receipt record
    const receipt = new Receipt({
      filename: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      category: req.body.category,
      processingStatus: 'processing'
    });

    await receipt.save();

    // Process receipt asynchronously
    processReceipt(req.file.path)
      .then(async (extractedData) => {
        // Update receipt with extracted data
        receipt.merchant = extractedData.merchant;
        receipt.date = extractedData.date;
        receipt.total = extractedData.total;
        receipt.items = extractedData.items;
        receipt.rawText = extractedData.rawText;
        receipt.confidence = extractedData.confidence;
        receipt.processingStatus = 'completed';
        await receipt.save();
      })
      .catch(async (error) => {
        console.error('Processing error:', error);
        receipt.processingStatus = 'failed';
        await receipt.save();
      });

    // Respond immediately with receipt ID
    res.status(200).json({
      message: 'File uploaded and processing started',
      receipt: {
        id: receipt._id,
        filename: receipt.filename,
        category: receipt.category,
        uploadDate: receipt.uploadDate,
        status: receipt.processingStatus
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
};

const getReceiptData = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Format the response to match the desired structure
    const response = {
      id: receipt._id,
      status: receipt.processingStatus,
      data: receipt.processingStatus === 'completed' ? {
        merchant: receipt.merchant,
        date: receipt.date,
        total: receipt.total,
        items: receipt.items,
        category: receipt.category
      } : null
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ error: 'Error fetching receipt data' });
  }
};

module.exports = {
  uploadReceipt,
  getReceiptData
}; 