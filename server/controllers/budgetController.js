const Budget = require('../models/Budget');

const setBudget = async (req, res) => {
  const { category, amount } = req.body;
  if (!category || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Category and amount required' });
  }
  try {
    const budget = await Budget.findOneAndUpdate(
      { category },
      { amount },
      { upsert: true, new: true }
    );
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Error setting budget' });
  }
};

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({});
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching budgets' });
  }
};

module.exports = { setBudget, getBudgets }; 