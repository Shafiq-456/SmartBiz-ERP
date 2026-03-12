const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/transactions
router.get('/', authenticateToken, (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM transactions';
    const params = [];
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    query += ' ORDER BY date DESC, created_at DESC';
    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/summary
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const income = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'Income'").get().total;
    const expense = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'Expense'").get().total;

    const incomeByCategory = db.prepare(`
      SELECT category, SUM(amount) as total 
      FROM transactions WHERE type = 'Income' 
      GROUP BY category ORDER BY total DESC
    `).all();

    const expenseByCategory = db.prepare(`
      SELECT category, SUM(amount) as total 
      FROM transactions WHERE type = 'Expense' 
      GROUP BY category ORDER BY total DESC
    `).all();

    const monthlyData = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      GROUP BY month
      ORDER BY month ASC
    `).all();

    res.json({
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense,
      incomeByCategory,
      expenseByCategory,
      monthlyData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post('/', authenticateToken, (req, res) => {
  try {
    const { type, category, amount, description, date, reference } = req.body;
    const result = db.prepare(
      'INSERT INTO transactions (type, category, amount, description, date, reference) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(type, category, amount, description || '', date, reference || '');
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { type, category, amount, description, date, reference } = req.body;
    db.prepare(
      'UPDATE transactions SET type=?, category=?, amount=?, description=?, date=?, reference=? WHERE id=?'
    ).run(type, category, amount, description, date, reference, req.params.id);
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
