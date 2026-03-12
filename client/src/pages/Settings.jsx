import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { User, Lock, Save } from 'lucide-react';
import api from '../api';

export default function Settings() {
  const { user, login, addToast } = useContext(AppContext);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setProfile({ name: data.name, email: data.email });
    } catch (err) {
      addToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', profile);
      login(data.user, localStorage.getItem('token'));
      addToast('Profile updated successfully');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (passwords.newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      addToast('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to change password', 'error');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">Profile Information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update your name and email</p>
          </div>
        </div>
        <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile({...profile, email: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <input
              disabled
              value={user?.role || ''}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 shadow-lg shadow-primary-500/25">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">Change Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Keep your account secure</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwords.newPassword}
              onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-amber-500/25">
              <Lock className="w-4 h-4" /> Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
