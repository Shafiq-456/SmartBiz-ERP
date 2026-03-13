import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { Plus, Pencil, Trash2, Search, X, Calendar, DollarSign, ClipboardCheck } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import api from '../api';

const emptyEmployee = { name: '', email: '', phone: '', department: '', position: '', salary: '', hire_date: '', status: 'Active' };

export default function Employees() {
  const { addToast } = useContext(AppContext);
  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAttendance, setShowAttendance] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEmployee);
  const [tab, setTab] = useState('list');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [empRes, payRes] = await Promise.all([
        api.get('/employees'),
        api.get('/employees/payroll/summary'),
      ]);
      setEmployees(empRes.data);
      setPayroll(payRes.data);
    } catch (err) {
      addToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, salary: parseFloat(form.salary) };
      if (editing) {
        await api.put(`/employees/${editing.id}`, payload);
        addToast('Employee updated');
      } else {
        await api.post('/employees', payload);
        addToast('Employee added');
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyEmployee);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save employee', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      addToast('Employee deleted');
      loadData();
    } catch (err) {
      addToast('Failed to delete', 'error');
    }
  };

  const markAttendance = async (empId, status) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post(`/employees/${empId}/attendance`, {
        date: today,
        status,
        check_in: status !== 'Absent' ? new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
        check_out: ''
      });
      addToast(`Attendance marked: ${status}`);
    } catch (err) {
      addToast('Failed to mark attendance', 'error');
    }
  };

  const openEdit = (e) => {
    setEditing(e);
    setForm({ name: e.name, email: e.email, phone: e.phone, department: e.department, position: e.position, salary: e.salary.toString(), hire_date: e.hire_date, status: e.status });
    setShowModal(true);
  };

  const statusColors = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    Inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-600/30 dark:text-slate-400',
    'On Leave': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  };

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Employees</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{employees.length} team members</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyEmployee); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 shadow-lg shadow-primary-500/25">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          type="employees"
          title="No employees yet"
          message="Add your first employee to start managing your team. Track attendance, departments, and payroll."
          actionLabel="Add First Employee"
          onAction={() => { setEditing(null); setForm(emptyEmployee); setShowModal(true); }}
        />
      ) : (
      <>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {['list', 'payroll'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
            {t === 'list' ? 'Team' : 'Payroll'}
          </button>
        ))}
      </div>

      {tab === 'list' ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Employee</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Department</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Position</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Salary</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Attendance</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emp => (
                    <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{emp.name.split(' ').map(n => n[0]).join('')}</div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{emp.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.position}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[emp.status]}`}>{emp.status}</span></td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-white">${emp.salary.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {['Present', 'Absent', 'Late'].map(s => (
                            <button key={s} onClick={() => markAttendance(emp.id, s)} title={s}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                s === 'Present' ? 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                s === 'Absent' ? 'hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500' :
                                'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}>
                              {s === 'Present' ? '✓' : s === 'Absent' ? '✕' : '⏰'}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(emp.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Payroll Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 card-hover">
              <p className="text-sm text-slate-500 dark:text-slate-400">Active Employees</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{payroll?.totalEmployees}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 card-hover">
              <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Payroll</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">${payroll?.totalMonthlySalary?.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 card-hover">
              <p className="text-sm text-slate-500 dark:text-slate-400">Annual Payroll</p>
              <p className="text-2xl font-bold text-primary-500 mt-1">${payroll?.totalAnnualSalary?.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Department Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 font-semibold text-slate-600 dark:text-slate-300">Department</th>
                    <th className="text-center py-2 font-semibold text-slate-600 dark:text-slate-300">Headcount</th>
                    <th className="text-right py-2 font-semibold text-slate-600 dark:text-slate-300">Monthly Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll?.departments && Object.entries(payroll.departments).map(([dept, info]) => (
                    <tr key={dept} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-3 font-medium text-slate-800 dark:text-white">{dept}</td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-300">{info.count}</td>
                      <td className="py-3 text-right font-medium text-slate-800 dark:text-white">${info.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{editing ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input required value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Position</label>
                  <input required value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Salary ($)</label>
                  <input required type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hire Date</label>
                  <input required type="date" value={form.hire_date} onChange={e => setForm({...form, hire_date: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90">{editing ? 'Update' : 'Add'} Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
