const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadReceipt, getReceiptData } = require('../controllers/receiptController');

router.post('/upload', upload.single('file'), uploadReceipt);
router.get('/receipt/:id', getReceiptData);

module.exports = router; 