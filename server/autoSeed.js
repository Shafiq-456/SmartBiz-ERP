const bcrypt = require('bcryptjs');

function seedDatabase(db) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  console.log('🌱 Auto-seeding database...');
  const ADMIN_ID = 1;
  const hashedPassword = bcrypt.hashSync('Admin@123', 10);

  db.prepare('INSERT INTO users (name, email, password, role, has_seen_welcome) VALUES (?, ?, ?, ?, ?)').run('Admin User', 'admin@smartbiz.com', hashedPassword, 'Admin', 1);
  db.prepare('INSERT INTO users (name, email, password, role, has_seen_welcome) VALUES (?, ?, ?, ?, ?)').run('Sarah Manager', 'manager@smartbiz.com', hashedPassword, 'Manager', 1);
  db.prepare('INSERT INTO users (name, email, password, role, has_seen_welcome) VALUES (?, ?, ?, ?, ?)').run('John Staff', 'staff@smartbiz.com', hashedPassword, 'Staff', 1);

  const insertProduct = db.prepare('INSERT INTO products (user_id, name, sku, category, price, cost, stock, low_stock_threshold, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  [[ADMIN_ID,'Wireless Keyboard','KB-001','Electronics',79.99,35,150,20,'Ergonomic wireless keyboard'],[ADMIN_ID,'USB-C Hub','HB-002','Electronics',49.99,18,85,15,'7-in-1 USB-C hub'],[ADMIN_ID,'Office Chair Pro','CH-003','Furniture',299.99,120,30,5,'Ergonomic office chair'],[ADMIN_ID,'Standing Desk','DK-004','Furniture',499.99,200,15,3,'Electric standing desk'],[ADMIN_ID,'Monitor 27"','MN-005','Electronics',349.99,180,45,10,'27 inch 4K IPS monitor'],[ADMIN_ID,'Webcam HD','WC-006','Electronics',89.99,30,8,10,'1080p HD webcam'],[ADMIN_ID,'Desk Lamp LED','LM-007','Accessories',39.99,12,200,25,'Adjustable LED desk lamp'],[ADMIN_ID,'Notebook Pack','NB-008','Stationery',14.99,4,500,50,'Pack of 5 notebooks'],[ADMIN_ID,'Wireless Mouse','MS-009','Electronics',29.99,10,3,10,'Ergonomic wireless mouse'],[ADMIN_ID,'Headset Pro','HS-010','Electronics',129.99,55,60,10,'Noise-cancelling headset'],[ADMIN_ID,'Whiteboard 4x3','WB-011','Office',89.99,35,25,5,'Magnetic whiteboard'],[ADMIN_ID,'Printer Ink Set','PI-012','Supplies',44.99,15,7,10,'Ink cartridge set']].forEach(p => insertProduct.run(...p));

  const insertCustomer = db.prepare('INSERT INTO customers (user_id, name, email, phone, address, segment, total_orders, total_spent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  [[ADMIN_ID,'Acme Corp','contact@acme.com','+1-555-0101','123 Business Ave, NY','VIP',45,28500],[ADMIN_ID,'TechStart Inc','info@techstart.com','+1-555-0102','456 Innovation Blvd, SF','Regular',12,5400],[ADMIN_ID,'Green Solutions','hello@greensol.com','+1-555-0103','789 Eco Lane, Portland','Regular',8,3200],[ADMIN_ID,'Digital Nomads LLC','team@diginomads.com','+1-555-0104','321 Remote St, Austin','VIP',32,19800],[ADMIN_ID,'Fresh Retail Co','orders@freshretail.com','+1-555-0105','654 Market St, Chicago','New',2,800],[ADMIN_ID,'Summit Partners','buy@summit.com','+1-555-0106','987 Peak Rd, Denver','Regular',15,7500],[ADMIN_ID,'CloudWave Tech','procurement@cloudwave.com','+1-555-0107','147 Cloud Dr, Seattle','VIP',52,42000],[ADMIN_ID,'Urban Design Studio','studio@urbandesign.com','+1-555-0108','258 Art Blvd, LA','New',1,350]].forEach(c => insertCustomer.run(...c));

  const insertEmployee = db.prepare('INSERT INTO employees (user_id, name, email, phone, department, position, salary, hire_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  [[ADMIN_ID,'Alice Johnson','alice@smartbiz.com','+1-555-1001','Engineering','Senior Developer',95000,'2022-03-15','Active'],[ADMIN_ID,'Bob Williams','bob@smartbiz.com','+1-555-1002','Sales','Sales Manager',75000,'2021-07-20','Active'],[ADMIN_ID,'Carol Davis','carol@smartbiz.com','+1-555-1003','Marketing','Marketing Lead',70000,'2022-11-01','Active'],[ADMIN_ID,'David Brown','david@smartbiz.com','+1-555-1004','Engineering','Junior Developer',60000,'2023-06-10','Active'],[ADMIN_ID,'Eva Martinez','eva@smartbiz.com','+1-555-1005','HR','HR Manager',72000,'2021-01-05','Active'],[ADMIN_ID,'Frank Lee','frank@smartbiz.com','+1-555-1006','Finance','Accountant',65000,'2022-09-18','Active'],[ADMIN_ID,'Grace Kim','grace@smartbiz.com','+1-555-1007','Sales','Sales Rep',50000,'2023-02-28','On Leave'],[ADMIN_ID,'Henry Patel','henry@smartbiz.com','+1-555-1008','Engineering','DevOps Engineer',88000,'2022-05-12','Active']].forEach(e => insertEmployee.run(...e));

  const insertOrder = db.prepare('INSERT INTO orders (user_id, customer_id, status, total, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  [{cid:1,s:'Delivered',t:629.97,n:'Rush delivery',d:'2025-01-15',items:[{p:1,q:3,pr:79.99},{p:5,q:1,pr:349.99}]},{cid:2,s:'Shipped',t:549.98,n:'',d:'2025-02-03',items:[{p:3,q:1,pr:299.99},{p:6,q:1,pr:89.99},{p:7,q:4,pr:39.99}]},{cid:4,s:'Processing',t:999.98,n:'Bulk',d:'2025-02-20',items:[{p:4,q:2,pr:499.99}]},{cid:7,s:'Delivered',t:1299.90,n:'',d:'2025-01-28',items:[{p:10,q:10,pr:129.99}]},{cid:1,s:'Pending',t:179.97,n:'Restock',d:'2025-03-01',items:[{p:7,q:3,pr:39.99},{p:8,q:4,pr:14.99}]},{cid:3,s:'Delivered',t:449.97,n:'',d:'2025-01-10',items:[{p:2,q:3,pr:49.99},{p:5,q:1,pr:349.99}]}].forEach(o => {
    const r = insertOrder.run(ADMIN_ID, o.cid, o.s, o.t, o.n, o.d);
    o.items.forEach(i => insertOrderItem.run(r.lastInsertRowid, i.p, i.q, i.pr));
  });

  const insertTxn = db.prepare('INSERT INTO transactions (user_id, type, category, amount, description, date, reference) VALUES (?, ?, ?, ?, ?, ?, ?)');
  [[ADMIN_ID,'Income','Sales',629.97,'Order #1','2025-01-15','ORD-001'],[ADMIN_ID,'Income','Sales',549.98,'Order #2','2025-02-03','ORD-002'],[ADMIN_ID,'Income','Sales',1299.90,'Order #4','2025-01-28','ORD-004'],[ADMIN_ID,'Income','Sales',449.97,'Order #6','2025-01-10','ORD-006'],[ADMIN_ID,'Income','Services',5000,'Consulting Q1','2025-01-31','SVC-001'],[ADMIN_ID,'Income','Services',3500,'Tech support','2025-02-15','SVC-002'],[ADMIN_ID,'Expense','Salaries',45000,'Payroll Jan','2025-01-31','PAY-001'],[ADMIN_ID,'Expense','Salaries',45000,'Payroll Feb','2025-02-28','PAY-002'],[ADMIN_ID,'Expense','Rent',5000,'Rent Jan','2025-01-01','RNT-001'],[ADMIN_ID,'Expense','Rent',5000,'Rent Feb','2025-02-01','RNT-002'],[ADMIN_ID,'Expense','Utilities',800,'Utils Jan','2025-01-20','UTL-001'],[ADMIN_ID,'Expense','Utilities',750,'Utils Feb','2025-02-20','UTL-002'],[ADMIN_ID,'Expense','Marketing',3000,'Ads Q1','2025-01-15','MKT-001'],[ADMIN_ID,'Expense','Supplies',1200,'Supplies','2025-02-10','SUP-001'],[ADMIN_ID,'Income','Sales',2800,'Walk-in Jan','2025-01-31','WLK-001'],[ADMIN_ID,'Income','Sales',3200,'Walk-in Feb','2025-02-28','WLK-002']].forEach(t => insertTxn.run(...t));

  const insertAtt = db.prepare('INSERT OR IGNORE INTO attendance (employee_id, date, status, check_in, check_out) VALUES (?, ?, ?, ?, ?)');
  const dates = ['2025-03-03','2025-03-04','2025-03-05','2025-03-06','2025-03-07'];
  const sts = ['Present','Present','Late','Present','Absent'];
  for (let e = 1; e <= 8; e++) dates.forEach((d, i) => { const s = e===7?'Absent':sts[i]; insertAtt.run(e, d, s, s==='Absent'?'':(s==='Late'?'09:45':'09:00'), s==='Absent'?'':'18:00'); });

  console.log('🎉 Database auto-seeded!');
}

module.exports = seedDatabase;
