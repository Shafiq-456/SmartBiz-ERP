import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { Plus, Pencil, Trash2, Search, X, Users, Mail, Phone, MapPin } from 'lucide-react';
import api from '../api';

const emptyCustomer = { name: '', email: '', phone: '', address: '', segment: 'New' };

export default function Customers() {
  const { addToast } = useContext(AppContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCustomer);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (err) {
      addToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, form);
        addToast('Customer updated successfully');
      } else {
        await api.post('/customers', form);
        addToast('Customer added successfully');
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyCustomer);
      loadCustomers();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save customer', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      addToast('Customer deleted');
      loadCustomers();
    } catch (err) {
      addToast('Failed to delete customer', 'error');
    }
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, segment: c.segment });
    setShowModal(true);
  };

  const segmentColors = {
    VIP: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    Regular: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    New: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  };

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchSegment = segmentFilter === 'all' || c.segment === segmentFilter;
    return matchSearch && matchSegment;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Customers</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{customers.length} customers total</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyCustomer); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 shadow-lg shadow-primary-500/25">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="all">All Segments</option>
          <option value="VIP">👑 VIP</option>
          <option value="Regular">🔵 Regular</option>
          <option value="New">🟢 New</option>
        </select>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(customer => (
          <div key={customer.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{customer.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${segmentColors[customer.segment]}`}>{customer.segment}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(customer)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(customer.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5" /> <span className="truncate">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5" /> <span>{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5" /> <span className="truncate">{customer.address}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white">{customer.total_orders}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Orders</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-500">${customer.total_spent.toLocaleString()}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Spent</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">No customers found</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{editing ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Segment</label>
                <select value={form.segment} onChange={e => setForm({...form, segment: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="New">New</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90">{editing ? 'Update' : 'Add'} Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
