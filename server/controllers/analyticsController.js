const Receipt = require('../models/Receipt');
const Budget = require('../models/Budget');

const getMonthlyAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates or default to current month
    let start, end;
    try {
      start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    console.log('Analytics request for period:', { start, end });
    
    // Get all completed receipts for the date range
    const receipts = await Receipt.find({
      uploadDate: {
        $gte: start,
        $lte: end
      },
      processingStatus: 'completed'
    });

    console.log('Found receipts:', receipts.length);
    console.log('First few receipts:', receipts.slice(0, 2));

    // Calculate total spending by category
    const categoryTotals = {};
    let totalSpending = 0;

    receipts.forEach(receipt => {
      if (receipt.total) {
        categoryTotals[receipt.category] = (categoryTotals[receipt.category] || 0) + receipt.total;
        totalSpending += receipt.total;
      }
    });

    console.log('Category totals:', categoryTotals);
    console.log('Total spending:', totalSpending);

    // Get daily spending data
    const dailySpending = await Receipt.aggregate([
      {
        $match: {
          uploadDate: { $gte: start, $lte: end },
          processingStatus: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$uploadDate" } },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top merchants
    const topMerchants = await Receipt.aggregate([
      {
        $match: {
          uploadDate: { $gte: start, $lte: end },
          processingStatus: 'completed'
        }
      },
      {
        $group: {
          _id: "$merchant",
          total: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    // Get most frequent items
    const topItems = await Receipt.aggregate([
      {
        $match: {
          uploadDate: { $gte: start, $lte: end },
          processingStatus: 'completed'
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSpent: { $sum: "$items.price" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Fetch budgets
    const budgets = await Budget.find({});

    res.json({
      monthlyTotal: totalSpending,
      categoryTotals,
      dailySpending,
      topMerchants,
      topItems,
      budgets,
      metadata: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        receiptCount: receipts.length
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Error generating analytics' });
  }
};

module.exports = {
  getMonthlyAnalytics
}; 