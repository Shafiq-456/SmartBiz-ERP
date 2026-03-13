import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useCallback } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Finance from './pages/Finance';
import Settings from './pages/Settings';

export const AppContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const ProtectedRoute = ({ children, roles }) => {
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <AppContext.Provider value={{ user, setUser, darkMode, setDarkMode, addToast, login, logout }}>
      <Router>
        <Routes>
          <Route path="/login" element={
            user ? (user.has_seen_welcome === 0 ? <Navigate to="/welcome" /> : <Navigate to="/" />) : <Login />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/" /> : <Register />
          } />
          <Route path="/welcome" element={
            <ProtectedRoute><Welcome /></ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute><Layout /></ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="employees" element={
              <ProtectedRoute roles={['Admin', 'Manager']}><Employees /></ProtectedRoute>
            } />
            <Route path="finance" element={
              <ProtectedRoute roles={['Admin', 'Manager']}><Finance /></ProtectedRoute>
            } />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast-enter px-4 py-3 rounded-lg shadow-lg text-white font-medium text-sm flex items-center gap-2 min-w-[280px] ${
              toast.type === 'success' ? 'bg-emerald-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
            }`}
          >
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
            {toast.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export default App;
