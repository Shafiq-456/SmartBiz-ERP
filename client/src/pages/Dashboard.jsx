import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, revenueRes, productsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue-chart'),
        api.get('/dashboard/top-products'),
      ]);
      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
      setTopProducts(productsRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: 'gradient-primary',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      gradient: 'gradient-success',
      change: `${stats?.pendingOrders || 0} pending`,
      trend: 'neutral'
    },
    {
      title: 'Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      gradient: 'gradient-warning',
      change: '+3 this month',
      trend: 'up'
    },
    {
      title: 'Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      gradient: 'gradient-danger',
      change: `${stats?.lowStockCount || 0} low stock`,
      trend: stats?.lowStockCount > 0 ? 'down' : 'neutral'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{card.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${card.gradient} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {card.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {card.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {card.trend === 'neutral' && <Clock className="w-4 h-4 text-amber-500" />}
              <span className={`text-xs font-medium ${
                card.trend === 'up' ? 'text-emerald-500' :
                card.trend === 'down' ? 'text-red-500' : 'text-amber-500'
              }`}>
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" />
              <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '13px',
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" fontSize={12} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" fontSize={11} stroke="#94a3b8" width={90} tick={{ fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="total_sold" fill="#6366f1" radius={[0, 6, 6, 0]} name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Net Profit Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Profit & Loss</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Income</span>
              <span className="text-sm font-semibold text-emerald-500">${(stats?.totalRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</span>
              <span className="text-sm font-semibold text-red-500">${(stats?.totalExpenses || 0).toLocaleString()}</span>
            </div>
            <hr className="border-slate-200 dark:border-slate-700" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-800 dark:text-white">Net Profit</span>
              <span className={`text-lg font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ${(stats?.netProfit || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Low Stock Alert</h3>
          </div>
          {stats?.lowStockCount > 0 ? (
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-amber-500">{stats.lowStockCount}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">products need restocking</p>
              <a href="/inventory" className="inline-block mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
                View Inventory →
              </a>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">All products are well stocked!</p>
          )}
        </div>
      </div>
    </div>
  );
}
