const bcrypt = require('bcryptjs');

function seedDatabase(db) {
  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  console.log('🌱 Auto-seeding database...');

  const hashedPassword = bcrypt.hashSync('Admin@123', 10);
  const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  insertUser.run('Admin User', 'admin@smartbiz.com', hashedPassword, 'Admin');
  insertUser.run('Sarah Manager', 'manager@smartbiz.com', hashedPassword, 'Manager');
  insertUser.run('John Staff', 'staff@smartbiz.com', hashedPassword, 'Staff');

  const insertProduct = db.prepare('INSERT INTO products (name, sku, category, price, cost, stock, low_stock_threshold, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const products = [
    ['Wireless Keyboard', 'KB-001', 'Electronics', 79.99, 35.00, 150, 20, 'Ergonomic wireless keyboard with backlight'],
    ['USB-C Hub', 'HB-002', 'Electronics', 49.99, 18.00, 85, 15, '7-in-1 USB-C hub with HDMI'],
    ['Office Chair Pro', 'CH-003', 'Furniture', 299.99, 120.00, 30, 5, 'Ergonomic office chair with lumbar support'],
    ['Standing Desk', 'DK-004', 'Furniture', 499.99, 200.00, 15, 3, 'Electric standing desk 60x30'],
    ['Monitor 27"', 'MN-005', 'Electronics', 349.99, 180.00, 45, 10, '27 inch 4K IPS monitor'],
    ['Webcam HD', 'WC-006', 'Electronics', 89.99, 30.00, 8, 10, '1080p HD webcam with mic'],
    ['Desk Lamp LED', 'LM-007', 'Accessories', 39.99, 12.00, 200, 25, 'Adjustable LED desk lamp'],
    ['Notebook Pack', 'NB-008', 'Stationery', 14.99, 4.00, 500, 50, 'Pack of 5 premium notebooks'],
    ['Wireless Mouse', 'MS-009', 'Electronics', 29.99, 10.00, 3, 10, 'Ergonomic wireless mouse'],
    ['Headset Pro', 'HS-010', 'Electronics', 129.99, 55.00, 60, 10, 'Noise-cancelling headset'],
    ['Whiteboard 4x3', 'WB-011', 'Office', 89.99, 35.00, 25, 5, 'Magnetic whiteboard 4x3 feet'],
    ['Printer Ink Set', 'PI-012', 'Supplies', 44.99, 15.00, 7, 10, 'Compatible ink cartridge set'],
  ];
  for (const p of products) insertProduct.run(...p);

  const insertCustomer = db.prepare('INSERT INTO customers (name, email, phone, address, segment, total_orders, total_spent) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const customers = [
    ['Acme Corp', 'contact@acme.com', '+1-555-0101', '123 Business Ave, NY', 'VIP', 45, 28500.00],
    ['TechStart Inc', 'info@techstart.com', '+1-555-0102', '456 Innovation Blvd, SF', 'Regular', 12, 5400.00],
    ['Green Solutions', 'hello@greensol.com', '+1-555-0103', '789 Eco Lane, Portland', 'Regular', 8, 3200.00],
    ['Digital Nomads LLC', 'team@diginomads.com', '+1-555-0104', '321 Remote St, Austin', 'VIP', 32, 19800.00],
    ['Fresh Retail Co', 'orders@freshretail.com', '+1-555-0105', '654 Market St, Chicago', 'New', 2, 800.00],
    ['Summit Partners', 'buy@summit.com', '+1-555-0106', '987 Peak Rd, Denver', 'Regular', 15, 7500.00],
    ['CloudWave Tech', 'procurement@cloudwave.com', '+1-555-0107', '147 Cloud Dr, Seattle', 'VIP', 52, 42000.00],
    ['Urban Design Studio', 'studio@urbandesign.com', '+1-555-0108', '258 Art Blvd, LA', 'New', 1, 350.00],
  ];
  for (const c of customers) insertCustomer.run(...c);

  const insertEmployee = db.prepare('INSERT INTO employees (name, email, phone, department, position, salary, hire_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const employees = [
    ['Alice Johnson', 'alice@smartbiz.com', '+1-555-1001', 'Engineering', 'Senior Developer', 95000, '2022-03-15', 'Active'],
    ['Bob Williams', 'bob@smartbiz.com', '+1-555-1002', 'Sales', 'Sales Manager', 75000, '2021-07-20', 'Active'],
    ['Carol Davis', 'carol@smartbiz.com', '+1-555-1003', 'Marketing', 'Marketing Lead', 70000, '2022-11-01', 'Active'],
    ['David Brown', 'david@smartbiz.com', '+1-555-1004', 'Engineering', 'Junior Developer', 60000, '2023-06-10', 'Active'],
    ['Eva Martinez', 'eva@smartbiz.com', '+1-555-1005', 'HR', 'HR Manager', 72000, '2021-01-05', 'Active'],
    ['Frank Lee', 'frank@smartbiz.com', '+1-555-1006', 'Finance', 'Accountant', 65000, '2022-09-18', 'Active'],
    ['Grace Kim', 'grace@smartbiz.com', '+1-555-1007', 'Sales', 'Sales Rep', 50000, '2023-02-28', 'On Leave'],
    ['Henry Patel', 'henry@smartbiz.com', '+1-555-1008', 'Engineering', 'DevOps Engineer', 88000, '2022-05-12', 'Active'],
  ];
  for (const e of employees) insertEmployee.run(...e);

  const insertOrder = db.prepare('INSERT INTO orders (customer_id, status, total, notes, created_at) VALUES (?, ?, ?, ?, ?)');
  const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  const orderData = [
    { customerId: 1, status: 'Delivered', total: 629.97, notes: 'Rush delivery', date: '2025-01-15', items: [{ productId: 1, qty: 3, price: 79.99 }, { productId: 5, qty: 1, price: 349.99 }] },
    { customerId: 2, status: 'Shipped', total: 549.98, notes: '', date: '2025-02-03', items: [{ productId: 3, qty: 1, price: 299.99 }, { productId: 6, qty: 1, price: 89.99 }, { productId: 7, qty: 4, price: 39.99 }] },
    { customerId: 4, status: 'Processing', total: 999.98, notes: 'Bulk order', date: '2025-02-20', items: [{ productId: 4, qty: 2, price: 499.99 }] },
    { customerId: 7, status: 'Delivered', total: 1299.90, notes: '', date: '2025-01-28', items: [{ productId: 10, qty: 10, price: 129.99 }] },
    { customerId: 1, status: 'Pending', total: 179.97, notes: 'Office supplies restock', date: '2025-03-01', items: [{ productId: 7, qty: 3, price: 39.99 }, { productId: 8, qty: 4, price: 14.99 }] },
    { customerId: 3, status: 'Delivered', total: 449.97, notes: '', date: '2025-01-10', items: [{ productId: 2, qty: 3, price: 49.99 }, { productId: 5, qty: 1, price: 349.99 }] },
  ];
  for (const order of orderData) {
    const result = insertOrder.run(order.customerId, order.status, order.total, order.notes, order.date);
    for (const item of order.items) insertOrderItem.run(result.lastInsertRowid, item.productId, item.qty, item.price);
  }

  const insertTransaction = db.prepare('INSERT INTO transactions (type, category, amount, description, date, reference) VALUES (?, ?, ?, ?, ?, ?)');
  const txns = [
    ['Income', 'Sales', 629.97, 'Order #1 payment', '2025-01-15', 'ORD-001'],
    ['Income', 'Sales', 549.98, 'Order #2 payment', '2025-02-03', 'ORD-002'],
    ['Income', 'Sales', 1299.90, 'Order #4 payment', '2025-01-28', 'ORD-004'],
    ['Income', 'Sales', 449.97, 'Order #6 payment', '2025-01-10', 'ORD-006'],
    ['Income', 'Services', 5000.00, 'Consulting fee - Q1', '2025-01-31', 'SVC-001'],
    ['Income', 'Services', 3500.00, 'Technical support contract', '2025-02-15', 'SVC-002'],
    ['Expense', 'Salaries', 45000.00, 'Monthly payroll - Jan', '2025-01-31', 'PAY-001'],
    ['Expense', 'Salaries', 45000.00, 'Monthly payroll - Feb', '2025-02-28', 'PAY-002'],
    ['Expense', 'Rent', 5000.00, 'Office rent - Jan', '2025-01-01', 'RNT-001'],
    ['Expense', 'Rent', 5000.00, 'Office rent - Feb', '2025-02-01', 'RNT-002'],
    ['Expense', 'Utilities', 800.00, 'Electricity & Internet - Jan', '2025-01-20', 'UTL-001'],
    ['Expense', 'Utilities', 750.00, 'Electricity & Internet - Feb', '2025-02-20', 'UTL-002'],
    ['Expense', 'Marketing', 3000.00, 'Google Ads - Q1', '2025-01-15', 'MKT-001'],
    ['Expense', 'Supplies', 1200.00, 'Office supplies restock', '2025-02-10', 'SUP-001'],
    ['Income', 'Sales', 2800.00, 'Walk-in sales - Jan', '2025-01-31', 'WLK-001'],
    ['Income', 'Sales', 3200.00, 'Walk-in sales - Feb', '2025-02-28', 'WLK-002'],
  ];
  for (const t of txns) insertTransaction.run(...t);

  const insertAttendance = db.prepare('INSERT OR IGNORE INTO attendance (employee_id, date, status, check_in, check_out) VALUES (?, ?, ?, ?, ?)');
  const dates = ['2025-03-03', '2025-03-04', '2025-03-05', '2025-03-06', '2025-03-07'];
  const statuses = ['Present', 'Present', 'Late', 'Present', 'Absent'];
  for (let empId = 1; empId <= 8; empId++) {
    for (let i = 0; i < dates.length; i++) {
      const s = empId === 7 ? 'Absent' : statuses[i % statuses.length];
      const checkIn = s === 'Absent' ? '' : (s === 'Late' ? '09:45' : '09:00');
      const checkOut = s === 'Absent' ? '' : '18:00';
      insertAttendance.run(empId, dates[i], s, checkIn, checkOut);
    }
  }

  console.log('🎉 Database auto-seeded successfully!');
}

module.exports = seedDatabase;
