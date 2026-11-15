import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarDays,
  Truck,
  BookOpen,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Lock,
  X,
  Trash2,
} from 'lucide-react';
import { ViewName } from '../../types/enums';
import { AGENCY_LOGO_BASE64 } from '../../lib/logoBase64';

interface SidebarProps {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  agencyName: string;
  logoUrl?: string;
  onLock: () => void;
  isEncrypted: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  deletedCount?: number;
}

interface MenuItem {
  id: ViewName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  agencyName,
  logoUrl,
  onLock,
  isEncrypted,
  isMobileOpen = false,
  onCloseMobile,
  deletedCount = 0,
}) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'deliveries', label: 'Daily Deliveries', icon: Truck, badge: 'Core' },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'schedules', label: 'Subscriptions', icon: CalendarDays },
    { id: 'ledger', label: 'Customer Ledger', icon: BookOpen },
    { id: 'billing', label: 'Bills & Receipts', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    {
      id: 'bin',
      label: 'Recycle Bin',
      icon: Trash2,
      badge: deletedCount > 0 ? `${deletedCount}` : undefined,
    },
  ];

  const handleItemClick = (id: ViewName) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shadow-sm shrink-0">
            <img
              src={logoUrl || AGENCY_LOGO_BASE64}
              alt={agencyName}
              className="w-full h-full object-cover"
            />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="overflow-hidden">
              <h1 className="text-xs font-semibold text-white truncate leading-tight tracking-wide">
                {agencyName}
              </h1>
              <p className="text-[11px] text-blue-400 font-normal mt-0.5">Agency Mobile ERP</p>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              title={isCollapsed && !isMobileOpen ? item.label : undefined}
              className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-normal'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
              />
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-800 text-blue-400 border border-blue-900/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status & Lock */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {(!isCollapsed || isMobileOpen) && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 text-[11px] text-slate-400 border border-slate-800 font-normal">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEncrypted ? 'SQLCipher Secured' : 'SQLite Local'}</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">ACTIVE</span>
          </div>
        )}
        <button
          onClick={() => {
            onLock();
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-xl text-xs font-normal text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
        >
          <Lock className="w-3.5 h-3.5" />
          {(!isCollapsed || isMobileOpen) && <span>Lock Application</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex relative flex-col border-r border-slate-800 transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-18' : 'w-60'
        }`}
      >
        {sidebarContent}

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-16 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700 shadow-sm cursor-pointer z-40 transition-transform"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile Slide-Over Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
