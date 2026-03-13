const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Use /tmp on Vercel (serverless), local path otherwise
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel
  ? path.join('/tmp', 'smartbiz.db')
  : path.join(__dirname, 'smartbiz.db');

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Admin' CHECK(role IN ('Admin', 'Manager', 'Staff')),
    avatar TEXT DEFAULT '',
    has_seen_welcome INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    cost REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, sku),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    segment TEXT NOT NULL DEFAULT 'New' CHECK(segment IN ('VIP', 'Regular', 'New')),
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, email),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    total REAL NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    salary REAL NOT NULL DEFAULT 0,
    hire_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'On Leave')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, email),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Present' CHECK(status IN ('Present', 'Absent', 'Late', 'Half Day')),
    check_in TEXT DEFAULT '',
    check_out TEXT DEFAULT '',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE(employee_id, date)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    type TEXT NOT NULL CHECK(type IN ('Income', 'Expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    description TEXT DEFAULT '',
    date TEXT NOT NULL,
    reference TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Migration: add columns if they don't exist (for existing databases)
try {
  db.exec(`ALTER TABLE users ADD COLUMN has_seen_welcome INTEGER DEFAULT 0`);
} catch (e) { /* column already exists */ }

try {
  db.exec(`ALTER TABLE products ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1`);
} catch (e) { /* column already exists */ }

try {
  db.exec(`ALTER TABLE customers ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1`);
} catch (e) { /* column already exists */ }

try {
  db.exec(`ALTER TABLE orders ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1`);
} catch (e) { /* column already exists */ }

try {
  db.exec(`ALTER TABLE employees ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1`);
} catch (e) { /* column already exists */ }

try {
  db.exec(`ALTER TABLE transactions ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1`);
} catch (e) { /* column already exists */ }

module.exports = db;
