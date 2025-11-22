const express = require('express');
const router = express.Router();
const { getMonthlyAnalytics } = require('../controllers/analyticsController');

router.get('/monthly', getMonthlyAnalytics);

module.exports = router; 