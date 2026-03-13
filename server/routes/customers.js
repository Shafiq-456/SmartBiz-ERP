const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/customers
router.get('/', authenticateToken, (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, address, segment } = req.body;
    const result = db.prepare(
      'INSERT INTO customers (user_id, name, email, phone, address, segment) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, name, email, phone || '', address || '', segment || 'New');
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(customer);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Customer email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, address, segment } = req.body;
    db.prepare(
      'UPDATE customers SET name=?, email=?, phone=?, address=?, segment=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?'
    ).run(name, email, phone, address, segment, req.params.id, req.user.id);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM customers WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
