const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/employees
router.get('/', authenticateToken, (req, res) => {
  try {
    const employees = db.prepare('SELECT * FROM employees ORDER BY created_at DESC').all();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, department, position, salary, hire_date, status } = req.body;
    const result = db.prepare(
      'INSERT INTO employees (name, email, phone, department, position, salary, hire_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, email, phone || '', department, position, salary, hire_date, status || 'Active');
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(employee);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Employee email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, department, position, salary, hire_date, status } = req.body;
    db.prepare(
      'UPDATE employees SET name=?, email=?, phone=?, department=?, position=?, salary=?, hire_date=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
    ).run(name, email, phone, department, position, salary, hire_date, status, req.params.id);
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees/:id/attendance
router.post('/:id/attendance', authenticateToken, (req, res) => {
  try {
    const { date, status, check_in, check_out } = req.body;
    db.prepare(
      'INSERT OR REPLACE INTO attendance (employee_id, date, status, check_in, check_out) VALUES (?, ?, ?, ?, ?)'
    ).run(req.params.id, date, status, check_in || '', check_out || '');
    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id/attendance
router.get('/:id/attendance', authenticateToken, (req, res) => {
  try {
    const attendance = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 30'
    ).all(req.params.id);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/payroll/summary
router.get('/payroll/summary', authenticateToken, (req, res) => {
  try {
    const employees = db.prepare("SELECT * FROM employees WHERE status = 'Active'").all();
    const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
    const departments = {};
    for (const e of employees) {
      if (!departments[e.department]) departments[e.department] = { count: 0, total: 0 };
      departments[e.department].count++;
      departments[e.department].total += e.salary;
    }
    res.json({
      totalEmployees: employees.length,
      totalMonthlySalary: totalSalary,
      totalAnnualSalary: totalSalary * 12,
      departments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
