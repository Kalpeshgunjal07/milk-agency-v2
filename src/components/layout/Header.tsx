import React from 'react';
import { ViewName } from '../../types/enums';
import { Lock, Search, Database, Plus, Truck, CreditCard, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
  onLock: () => void;
  onQuickBackup: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddDelivery: () => void;
  onAddPayment: () => void;
  onAddCustomer: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onLock,
  onQuickBackup,
  searchQuery,
  onSearchChange,
  onAddDelivery,
  onAddPayment,
  onAddCustomer,
  onOpenMobileMenu,
}) => {
  const titles: Record<ViewName, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Live business performance & operational overview' },
    customers: { title: 'Customer Directory', subtitle: 'Customer accounts, delivery routes & balances' },
    products: { title: 'Dairy Products', subtitle: 'SKU pricing, measurement units & rates' },
    schedules: { title: 'Regular Delivery Schedules', subtitle: 'Recurring morning & evening subscriptions' },
    deliveries: { title: 'Daily Deliveries', subtitle: 'Daily bulk route distribution & confirmation' },
    ledger: { title: 'Customer Ledger', subtitle: 'Double-entry debits, credits & account balances' },
    payments: { title: 'Payment Register', subtitle: 'Cash, UPI & Bank transfer collections' },
    billing: { title: 'Bills & Receipts', subtitle: 'Thermal delivery slips & monthly statements' },
    reports: { title: 'Reports & Analytics', subtitle: 'Sales summaries, collection rates & analysis' },
    settings: { title: 'Agency Settings', subtitle: 'Business profile, receipt preferences & backups' },
    bin: { title: 'Recycle Bin & History', subtitle: 'Deleted customers & products history with restore or permanent purge' },
  };

  const current = titles[activeView] || { title: 'Milk Agency', subtitle: 'Management System' };
  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <header className="shrink-0 sticky top-0 z-30 flex items-center justify-between h-16 px-2 min-[360px]:px-3 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 gap-1.5 sm:gap-2 select-none shadow-2xs overflow-hidden">
      {/* Mobile Hamburger & Title */}
      <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 min-[360px]:p-2 -ml-0.5 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100/90 hover:bg-slate-200 active:scale-95 transition-all shrink-0 cursor-pointer border border-slate-200/60 shadow-2xs"
          title="Open Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 text-slate-800" />
        </button>

        <div className="min-w-0 flex-1">
          <h2 className="text-xs min-[360px]:text-sm font-semibold text-slate-800 tracking-tight leading-none truncate">
            {current.title}
          </h2>
          <p className="text-[11px] font-normal text-slate-500 mt-1 leading-none hidden sm:block truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Global Actions & Quick Tools */}
      <div className="flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-3 shrink-0">
        {/* Quick Search */}
        <div className="relative w-20 min-[360px]:w-28 sm:w-56 md:w-64">
          <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-6.5 min-[360px]:pl-7 sm:pl-9 pr-2 py-1.5 text-xs font-normal rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Date Display */}
        <div className="hidden lg:flex items-center px-3 py-1.5 text-xs font-normal text-slate-600 bg-slate-100 rounded-xl border border-slate-200/60 whitespace-nowrap">
          <span>{todayDate}</span>
        </div>

        {/* Action Shortcuts */}
        <Button
          size="sm"
          variant="outline"
          onClick={onAddDelivery}
          title="Record Delivery"
          className="hidden sm:inline-flex shrink-0"
        >
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden xl:inline text-xs font-medium">Record Delivery</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onAddPayment}
          title="Receive Payment"
          className="hidden sm:inline-flex shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden xl:inline text-xs font-medium">Receive Pay</span>
        </Button>

        <Button size="sm" variant="primary" onClick={onAddCustomer} title="Add Customer" className="shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs font-medium">Add</span>
        </Button>

        {/* Quick Backup */}
        <button
          onClick={onQuickBackup}
          title="Backup Database"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer hidden sm:block"
        >
          <Database className="w-4 h-4" />
        </button>

        {/* Quick Lock */}
        <button
          onClick={onLock}
          title="Lock Screen"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
