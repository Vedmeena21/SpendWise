const express = require('express');
const router = express.Router();
const { setBudget, getBudgets } = require('../controllers/budgetController');
const { getBudgetHistoryAnalysis } = require('../controllers/budgetAnalysisController');

router.post('/set', setBudget);
router.get('/all', getBudgets);
router.get('/history', getBudgetHistoryAnalysis);

module.exports = router;