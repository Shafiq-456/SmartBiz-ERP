import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { Plus, Trash2, Search, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api';

const emptyTxn = { type: 'Income', category: '', amount: '', description: '', date: '', reference: '' };

export default function Finance() {
  const { addToast } = useContext(AppContext);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyTxn);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [txnRes, sumRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/summary')
      ]);
      setTransactions(txnRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      addToast('Failed to load finance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) });
      addToast('Transaction added successfully');
      setShowModal(false);
      setForm(emptyTxn);
      loadData();
    } catch (err) {
      addToast('Failed to add transaction', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      addToast('Transaction deleted');
      loadData();
    } catch (err) {
      addToast('Failed to delete transaction', 'error');
    }
  };

  const filtered = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = summary?.monthlyData?.map(d => ({
    month: months[parseInt(d.month.split('-')[1]) - 1],
    Income: d.income,
    Expense: d.expense,
    Profit: d.income - d.expense
  })) || [];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Finance</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track income, expenses, and profit</p>
        </div>
        <button onClick={() => { setForm(emptyTxn); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 shadow-lg shadow-primary-500/25">
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-emerald-500">${(summary?.totalIncome || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-500" /></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-red-500">${(summary?.totalExpense || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary-500" /></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Net Profit</p>
          </div>
          <p className={`text-2xl font-bold ${(summary?.netProfit || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>${(summary?.netProfit || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* P&L Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Profit & Loss Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" />
            <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }} formatter={(value) => [`$${value.toLocaleString()}`, undefined]} />
            <Legend />
            <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-3">Income by Category</h3>
          <div className="space-y-3">
            {summary?.incomeByCategory?.map((c, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">{c.category}</span>
                <span className="text-sm font-semibold text-emerald-500">${c.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-3">Expenses by Category</h3>
          <div className="space-y-3">
            {summary?.expenseByCategory?.map((c, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">{c.category}</span>
                <span className="text-sm font-semibold text-red-500">${c.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="all">All Types</option>
          <option value="Income">💰 Income</option>
          <option value="Expense">💸 Expense</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Description</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Amount</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(txn => (
                <tr key={txn.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      txn.type === 'Income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>{txn.type}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{txn.category}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">{txn.description}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(txn.date).toLocaleDateString()}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${txn.type === 'Income' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {txn.type === 'Income' ? '+' : '-'}${txn.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(txn.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add Transaction</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Sales, Rent, Marketing"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ($)</label>
                <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference</label>
                <input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} placeholder="e.g. INV-001"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90">Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
