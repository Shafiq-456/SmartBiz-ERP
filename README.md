# 🏢 SmartBiz ERP

A modern, full-stack **Enterprise Resource Planning** web application built for Small & Medium Businesses. Manage inventory, orders, customers, employees, finances — all from one beautiful dashboard.

![SmartBiz ERP](https://img.shields.io/badge/SmartBiz-ERP-6366f1?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ✨ Features

- **📊 Dashboard** — Real-time stats, revenue chart, top products, P&L summary
- **📦 Inventory** — Product CRUD, low-stock alerts with pulse animation, search & filters
- **🛒 Orders** — Create orders (auto stock reduction), status management, order details
- **👥 Customers** — Customer management with segment badges (VIP / Regular / New)
- **👨‍💼 Employees** — Team management, attendance marking, payroll summary by department
- **💰 Finance** — Income/expense tracking, Profit & Loss chart, category breakdowns
- **⚙️ Settings** — Profile updates, password change
- **🌙 Dark Mode** — Full dark/light mode toggle
- **🔐 Auth** — JWT authentication with role-based access (Admin, Manager, Staff)
- **🔔 Toast Notifications** — Success/error feedback on every action
- **📱 Responsive** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Tailwind CSS, React Router, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (better-sqlite3) |
| **Auth** | JWT (jsonwebtoken) + Bcrypt |

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Shafiq-456/SmartBiz-ERP.git
cd SmartBiz-ERP
```

### 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Seed the database

```bash
cd server
node seed.js
```

### 4. Run the app

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5001)
cd server
node index.js

# Terminal 2 — Frontend (port 3000)
cd client
npm run dev
```

### 5. Open in browser

Visit **http://localhost:3000**

---

## 🔑 Default Login

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@smartbiz.com` | `Admin@123` |
| Manager | `manager@smartbiz.com` | `Admin@123` |
| Staff | `staff@smartbiz.com` | `Admin@123` |

---

## 📁 Project Structure

```
SmartBiz-ERP/
├── server/                  # Backend
│   ├── index.js             # Express server entry
│   ├── db.js                # SQLite database & schema
│   ├── seed.js              # Sample data seeder
│   ├── middleware/
│   │   └── auth.js          # JWT auth middleware
│   └── routes/
│       ├── auth.js          # Login, profile, password
│       ├── dashboard.js     # Stats, charts data
│       ├── products.js      # Inventory CRUD
│       ├── customers.js     # Customer CRUD
│       ├── orders.js        # Orders + stock reduction
│       ├── employees.js     # Employees + attendance + payroll
│       └── transactions.js  # Finance CRUD + P&L
├── client/                  # Frontend
│   ├── src/
│   │   ├── App.jsx          # Router, auth, toasts, dark mode
│   │   ├── api.js           # Axios with JWT interceptor
│   │   ├── components/
│   │   │   └── Layout.jsx   # Sidebar, header, navigation
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Inventory.jsx
│   │       ├── Orders.jsx
│   │       ├── Customers.jsx
│   │       ├── Employees.jsx
│   │       ├── Finance.jsx
│   │       └── Settings.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 📊 Database Tables

| Table | Description |
|-------|-------------|
| `users` | Admin, Manager, Staff accounts |
| `products` | Inventory with stock tracking |
| `customers` | Customer profiles with segments |
| `orders` | Order headers with status |
| `order_items` | Line items per order |
| `employees` | Team members with salary |
| `attendance` | Daily attendance records |
| `transactions` | Income & expense entries |

---

## 🔒 Role-Based Access

| Feature | Admin | Manager | Staff |
|---------|:-----:|:-------:|:-----:|
| Dashboard | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ |
| Employees | ✅ | ✅ | ❌ |
| Finance | ✅ | ✅ | ❌ |
| Settings | ✅ | ✅ | ✅ |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by [Shafiq](https://github.com/Shafiq-456)**
