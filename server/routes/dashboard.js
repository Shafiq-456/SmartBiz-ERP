const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const uid = req.user.id;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'Income'").get(uid).total;
    const totalOrders = db.prepare('SELECT COUNT(*) as total FROM orders WHERE user_id = ?').get(uid).total;
    const totalCustomers = db.prepare('SELECT COUNT(*) as total FROM customers WHERE user_id = ?').get(uid).total;
    const totalProducts = db.prepare('SELECT COUNT(*) as total FROM products WHERE user_id = ?').get(uid).total;
    const lowStockCount = db.prepare('SELECT COUNT(*) as total FROM products WHERE user_id = ? AND stock <= low_stock_threshold').get(uid).total;
    const pendingOrders = db.prepare("SELECT COUNT(*) as total FROM orders WHERE user_id = ? AND status = 'Pending'").get(uid).total;
    const totalExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'Expense'").get(uid).total;
    const totalEmployees = db.prepare('SELECT COUNT(*) as total FROM employees WHERE user_id = ?').get(uid).total;

    // Onboarding status
    const onboarding = {
      hasProducts: totalProducts > 0,
      hasCustomers: totalCustomers > 0,
      hasOrders: totalOrders > 0,
      hasEmployees: totalEmployees > 0,
      allComplete: totalProducts > 0 && totalCustomers > 0 && totalOrders > 0 && totalEmployees > 0
    };

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      pendingOrders,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      onboarding
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
      FROM transactions WHERE user_id = ?
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `).all(req.user.id);

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
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = ?
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `).all(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
