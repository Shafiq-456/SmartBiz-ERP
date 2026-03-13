import { Package, ShoppingCart, Users, UserCheck, DollarSign, Database } from 'lucide-react';

const icons = {
  products: Package,
  orders: ShoppingCart,
  customers: Users,
  employees: UserCheck,
  finance: DollarSign,
  default: Database,
};

export default function EmptyState({ type = 'default', title, message, actionLabel, onAction }) {
  const Icon = icons[type] || icons.default;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-500/20 dark:to-primary-600/20 flex items-center justify-center mb-6 animate-pulse">
        <Icon className="w-10 h-10 text-primary-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-md mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 shadow-lg shadow-primary-500/25 transition-all hover:scale-105"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
