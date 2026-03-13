const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', authenticateToken, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/low-stock
router.get('/low-stock', authenticateToken, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products WHERE user_id = ? AND stock <= low_stock_threshold ORDER BY stock ASC').all(req.user.id);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, sku, category, price, cost, stock, low_stock_threshold, description } = req.body;
    const result = db.prepare(
      'INSERT INTO products (user_id, name, sku, category, price, cost, stock, low_stock_threshold, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, name, sku, category, price, cost, stock, low_stock_threshold || 10, description || '');
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, sku, category, price, cost, stock, low_stock_threshold, description } = req.body;
    db.prepare(
      'UPDATE products SET name=?, sku=?, category=?, price=?, cost=?, stock=?, low_stock_threshold=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?'
    ).run(name, sku, category, price, cost, stock, low_stock_threshold, description, req.params.id, req.user.id);
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
