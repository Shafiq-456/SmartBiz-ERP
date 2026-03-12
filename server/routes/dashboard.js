const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'Income'").get().total;
    const totalOrders = db.prepare('SELECT COUNT(*) as total FROM orders').get().total;
    const totalCustomers = db.prepare('SELECT COUNT(*) as total FROM customers').get().total;
    const totalProducts = db.prepare('SELECT COUNT(*) as total FROM products').get().total;
    const lowStockCount = db.prepare('SELECT COUNT(*) as total FROM products WHERE stock <= low_stock_threshold').get().total;
    const pendingOrders = db.prepare("SELECT COUNT(*) as total FROM orders WHERE status = 'Pending'").get().total;
    const totalExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'Expense'").get().total;

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      pendingOrders,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/revenue-chart
router.get('/revenue-chart', authenticateToken, (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `).all();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = data.map(d => ({
      month: months[parseInt(d.month.split('-')[1]) - 1] + ' ' + d.month.split('-')[0].slice(2),
      income: d.income,
      expense: d.expense
    }));

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/top-products
router.get('/top-products', authenticateToken, (req, res) => {
  try {
    const data = db.prepare(`
      SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
