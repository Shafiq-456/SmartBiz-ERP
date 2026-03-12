const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/customers
router.get('/', authenticateToken, (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
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
      'INSERT INTO customers (name, email, phone, address, segment) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, phone || '', address || '', segment || 'New');
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
      'UPDATE customers SET name=?, email=?, phone=?, address=?, segment=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
    ).run(name, email, phone, address, segment, req.params.id);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
