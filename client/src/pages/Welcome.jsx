import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { AppContext } from '../App';
import api from '../api';

export default function Welcome() {
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const dismissWelcome = async (redirectTo = '/') => {
    try {
      await api.put('/auth/welcome-seen');
      const updatedUser = { ...user, has_seen_welcome: 1 };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) { /* ignore */ }
    navigate(redirectTo);
  };

  const actions = [
    {
      icon: Package,
      title: 'Add First Product',
      desc: 'Start building your inventory',
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/25',
      path: '/inventory',
    },
    {
      icon: Users,
      title: 'Add First Customer',
      desc: 'Build your customer base',
      color: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/25',
      path: '/customers',
    },
    {
      icon: UserCheck,
      title: 'Add First Employee',
      desc: 'Grow your team',
      color: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/25',
      path: '/employees',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      <div className="w-full max-w-2xl">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl text-center">
          {/* Sparkle Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 mb-6 shadow-lg shadow-primary-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome to SmartBiz ERP{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-slate-400 text-base mb-10 max-w-lg mx-auto">
            Your workspace is ready. Start by adding your first product, customer, or employee to get started.
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {actions.map((action) => (
              <button
                key={action.title}
                onClick={() => dismissWelcome(action.path)}
                className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:scale-105 text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg ${action.shadow}`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-slate-400 text-xs">{action.desc}</p>
              </button>
            ))}
          </div>

          {/* Skip Button */}
          <button
            onClick={() => dismissWelcome('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10 hover:border-white/20"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
