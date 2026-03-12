import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { Plus, Pencil, Trash2, Search, AlertTriangle, X, Package } from 'lucide-react';
import api from '../api';

const emptyProduct = { name: '', sku: '', category: '', price: '', cost: '', stock: '', low_stock_threshold: '10', description: '' };

export default function Inventory() {
  const { addToast } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        cost: parseFloat(form.cost),
        stock: parseInt(form.stock),
        low_stock_threshold: parseInt(form.low_stock_threshold),
      };
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        addToast('Product updated successfully');
      } else {
        await api.post('/products', payload);
        addToast('Product added successfully');
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyProduct);
      loadProducts();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save product', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      addToast('Product deleted successfully');
      loadProducts();
    } catch (err) {
      addToast('Failed to delete product', 'error');
    }
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      description: product.description || '',
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    setShowModal(true);
  };

  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.sku.toLowerCase().includes(search.toLowerCase());
    if (filter === 'low-stock') return matchSearch && p.stock <= p.low_stock_threshold;
    if (filter !== 'all') return matchSearch && p.category === filter;
    return matchSearch;
  });

  const lowStockCount = products.filter(p => p.stock <= p.low_stock_threshold).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{products.length} products total</p>
        </div>
        <button onClick={openAdd} id="add-product-btn" className="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Low Stock Banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>{lowStockCount}</strong> product{lowStockCount > 1 ? 's' : ''} {lowStockCount > 1 ? 'are' : 'is'} running low on stock
          </p>
          <button onClick={() => setFilter('low-stock')} className="ml-auto text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">View</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="all">All Categories</option>
          <option value="low-stock">⚠️ Low Stock</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">SKU</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Price</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Cost</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Stock</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => {
                const isLow = product.stock <= product.low_stock_threshold;
                return (
                  <tr key={product.id} className="border-b border-slate-100 dark:border-slate-700/50 table-row-hover hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-primary-500" />
                        </div>
                        <span className="font-medium text-slate-800 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{product.category}</span></td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-white">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">${product.cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isLow ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 pulse-low-stock' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      }`}>
                        {isLow && <AlertTriangle className="w-3 h-3" />}
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                  <input required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost ($)</label>
                  <input required type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock</label>
                  <input required type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Low Stock Alert</label>
                  <input required type="number" value={form.low_stock_threshold} onChange={e => setForm({...form, low_stock_threshold: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">{editing ? 'Update' : 'Add'} Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
