import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { Plus, Eye, Search, X, ShoppingCart, ChevronDown } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import api from '../api';

export default function Orders() {
  const { addToast } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ordersRes, custRes, prodRes] = await Promise.all([
        api.get('/orders'), api.get('/customers'), api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer_id: parseInt(form.customer_id),
        notes: form.notes,
        items: form.items.filter(i => i.product_id).map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      };
      await api.post('/orders', payload);
      addToast('Order created successfully! Stock updated.');
      setShowCreate(false);
      setForm({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create order', 'error');
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      addToast(`Order status updated to ${status}`);
      loadData();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const viewOrder = async (orderId) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setShowDetail(data);
    } catch (err) {
      addToast('Failed to load order details', 'error');
    }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx][field] = value;
    setForm({ ...form, items });
  };

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const statusColors = {
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    Shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.customer_name?.toLowerCase().includes(search.toLowerCase()) || `#${o.id}`.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{orders.length} orders total</p>
        </div>
        <button onClick={() => setShowCreate(true)} id="create-order-btn" className="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25">
          <Plus className="w-4 h-4" /> Create Order
        </button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          type="orders"
          title="No orders yet"
          message="Create your first order to start tracking sales. You'll need to add products and customers first."
          actionLabel="Create First Order"
          onAction={() => setShowCreate(true)}
        />
      ) : (
      <>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-slate-100 dark:border-slate-700/50 table-row-hover hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">#{order.id.toString().padStart(4, '0')}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{order.customer_name}</td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`appearance-none cursor-pointer px-3 py-1 pr-7 rounded-full text-xs font-semibold border-0 outline-none ${statusColors[order.status]}`}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-white">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => viewOrder(order.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Create Order Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Create Order</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer</label>
                <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Items</label>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} required
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">Select product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                    </select>
                    <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addItem} className="text-sm text-primary-500 font-medium hover:text-primary-600 mt-1">+ Add Item</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Order #{showDetail.id.toString().padStart(4, '0')}</h2>
              <button onClick={() => setShowDetail(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Customer</span>
                <span className="font-medium text-slate-800 dark:text-white">{showDetail.customer_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[showDetail.status]}`}>{showDetail.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Date</span>
                <span className="text-slate-800 dark:text-white">{new Date(showDetail.created_at).toLocaleDateString()}</span>
              </div>
              {showDetail.notes && (
                <div className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Notes: </span>
                  <span className="text-slate-700 dark:text-slate-300">{showDetail.notes}</span>
                </div>
              )}
              <hr className="border-slate-200 dark:border-slate-700" />
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-2">Items</h4>
                {showDetail.items?.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <span className="text-slate-600 dark:text-slate-300">{item.product_name} x{item.quantity}</span>
                    <span className="font-medium text-slate-800 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-semibold text-slate-800 dark:text-white">Total</span>
                <span className="text-lg font-bold text-primary-500">${showDetail.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
