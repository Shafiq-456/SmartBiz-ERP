const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders
router.get('/', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, c.name as customer_name 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const order = db.prepare(`
      SELECT o.*, c.name as customer_name 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      WHERE o.id = ?
    `).get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = db.prepare(`
      SELECT oi.*, p.name as product_name, p.sku 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `).all(req.params.id);

    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders
router.post('/', authenticateToken, (req, res) => {
  try {
    const { customer_id, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Calculate total and validate stock
    let total = 0;
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!product) return res.status(400).json({ error: `Product ${item.product_id} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }
      item.price = product.price;
      total += product.price * item.quantity;
    }

    // Create order
    const result = db.prepare(
      'INSERT INTO orders (customer_id, total, notes) VALUES (?, ?, ?)'
    ).run(customer_id, total, notes || '');

    const orderId = result.lastInsertRowid;

    // Insert items and reduce stock
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    const updateStock = db.prepare('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

    for (const item of items) {
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
      updateStock.run(item.quantity, item.product_id);
    }

    // Update customer stats
    db.prepare(
      'UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(total, customer_id);

    const order = db.prepare(`
      SELECT o.*, c.name as customer_name 
      FROM orders o JOIN customers c ON o.customer_id = c.id 
      WHERE o.id = ?
    `).get(orderId);
    const orderItems = db.prepare(`
      SELECT oi.*, p.name as product_name 
      FROM order_items oi JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `).all(orderId);

    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    const order = db.prepare(`
      SELECT o.*, c.name as customer_name 
      FROM orders o JOIN customers c ON o.customer_id = c.id 
      WHERE o.id = ?
    `).get(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
