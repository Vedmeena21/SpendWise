const Receipt = require('../models/Receipt');
const Budget = require('../models/Budget');

function getMonthStartEnd(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

async function getCategoryTotalsForMonth(year, month) {
  const { start, end } = getMonthStartEnd(year, month);
  const receipts = await Receipt.find({
    uploadDate: { $gte: start, $lte: end },
    processingStatus: 'completed',
  });
  const totals = {};
  receipts.forEach((r) => {
    if (r.total && r.category) {
      totals[r.category] = (totals[r.category] || 0) + r.total;
    }
  });
  return totals;
}

const getBudgetHistoryAnalysis = async (req, res) => {
  try {
    const { start, end } = req.query; // YYYY-MM
    if (!start || !end) return res.status(400).json({ error: 'start and end required' });
    const [startYear, startMonth] = start.split('-').map(Number);
    const [endYear, endMonth] = end.split('-').map(Number);
    // Build list of months
    const months = [];
    let y = startYear, m = startMonth;
    while (y < endYear || (y === endYear && m <= endMonth)) {
      months.push({ year: y, month: m });
      m++;
      if (m > 12) { m = 1; y++; }
    }
    // Get budgets (assume static for now)
    const budgetsArr = await Budget.find({});
    const budgets = {};
    budgetsArr.forEach((b) => { budgets[b.category] = b.amount; });
    // For each month, get totals
    const perMonth = [];
    for (const { year, month } of months) {
      const totals = await getCategoryTotalsForMonth(year, month);
      perMonth.push({ year, month, totals });
    }
    // For each category, compute stats
    const categories = Object.keys(budgets);
    const stats = {};
    categories.forEach((cat) => {
      let under = 0, over = 0, totalUnderPct = 0, totalOverPct = 0, count = 0;
      perMonth.forEach(({ totals }) => {
        const spent = totals[cat] || 0;
        const budget = budgets[cat] || 0;
        if (budget === 0) return;
        count++;
        if (spent <= budget) {
          under++;
          totalUnderPct += ((budget - spent) / budget) * 100;
        } else {
          over++;
          totalOverPct += ((spent - budget) / budget) * 100;
        }
      });
      stats[cat] = {
        monthsUnder: under,
        monthsOver: over,
        avgUnderPct: under ? totalUnderPct / under : 0,
        avgOverPct: over ? totalOverPct / over : 0,
        totalMonths: count,
      };
    });
    res.json({
      stats,
      months: perMonth.map(({ year, month }) => ({ year, month })),
    });
  } catch (error) {
    console.error('Budget history analysis error:', error);
    res.status(500).json({ error: 'Error generating budget history analysis' });
  }
};

module.exports = { getBudgetHistoryAnalysis };
