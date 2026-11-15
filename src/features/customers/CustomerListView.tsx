import React, { useMemo, useState } from 'react';
import { CustomerRecord, LedgerEntryRecord } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatPaiseAsINR } from '../../lib/calculations/money';
import { formatDate } from '../../lib/formatters/date';
import {
  Plus,
  Eye,
  Edit3,
  Trash2,
  Truck,
  CreditCard,
  Phone,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Navigation,
  MessageCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { openWhatsAppShare, formatInvoiceWhatsAppMessage } from '../../lib/whatsapp/share';

interface CustomerListViewProps {
  customers: CustomerRecord[];
  ledgerEntries: LedgerEntryRecord[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: CustomerRecord) => void;
  onDeleteCustomer?: (id: number) => Promise<void>;
  onViewCustomer: (customer: CustomerRecord) => void;
  onRecordDelivery: (customerId: number) => void;
  onRecordPayment: (customerId: number) => void;
  searchQuery: string;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  customers,
  ledgerEntries,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onViewCustomer,
  onRecordDelivery,
  onRecordPayment,
  searchQuery,
}) => {
  const [customerToDelete, setCustomerToDelete] = useState<CustomerRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'dues' | 'settled' | 'advance'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'code' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [viewMode, setViewMode] = useState<'adaptive' | 'cards' | 'table'>('adaptive');

  // Compute live current balances
  const customersWithBalance = useMemo(() => {
    return customers
      .filter((c) => !c.deleted_at)
      .map((c) => {
        const custEntries = ledgerEntries.filter((l) => l.customer_id === c.id);
        const currentBalance = custEntries.length
          ? custEntries[custEntries.length - 1].running_balance
          : c.opening_balance;
        return {
          ...c,
          currentBalance,
        };
      });
  }, [customers, ledgerEntries]);

  // Distinct Route list
  const routes = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.route_area && c.route_area.trim()) set.add(c.route_area.trim());
    });
    return ['all', ...Array.from(set)];
  }, [customers]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const totalCustomers = customersWithBalance.length;
    const activeCount = customersWithBalance.filter((c) => c.status === 'active').length;
    const totalDuesPaise = customersWithBalance
      .filter((c) => c.currentBalance > 0)
      .reduce((sum, c) => sum + c.currentBalance, 0);
    const customersWithDues = customersWithBalance.filter((c) => c.currentBalance > 0).length;
    const settledCount = customersWithBalance.filter((c) => c.currentBalance === 0).length;
    const totalAdvancePaise = Math.abs(
      customersWithBalance
        .filter((c) => c.currentBalance < 0)
        .reduce((sum, c) => sum + c.currentBalance, 0)
    );

    return {
      totalCustomers,
      activeCount,
      totalDuesPaise,
      customersWithDues,
      settledCount,
      totalAdvancePaise,
      routeCount: routes.filter((r) => r !== 'all').length,
    };
  }, [customersWithBalance, routes]);

  // Filter & Sort rows
  const filteredRows = useMemo(() => {
    const result = customersWithBalance.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (routeFilter !== 'all' && c.route_area !== routeFilter) return false;
      if (balanceFilter === 'dues' && c.currentBalance <= 0) return false;
      if (balanceFilter === 'settled' && c.currentBalance !== 0) return false;
      if (balanceFilter === 'advance' && c.currentBalance >= 0) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.customer_code.toLowerCase().includes(q) ||
          (c.mobile && c.mobile.includes(q)) ||
          (c.route_area && c.route_area.toLowerCase().includes(q))
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'balance') cmp = a.currentBalance - b.currentBalance;
      else if (sortBy === 'code') cmp = a.customer_code.localeCompare(b.customer_code);
      else if (sortBy === 'date') cmp = a.joining_date.localeCompare(b.joining_date);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [customersWithBalance, statusFilter, routeFilter, balanceFilter, searchQuery, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const handleToggleSort = (field: 'name' | 'balance' | 'code' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* 4 Metric Summary Cards (2 cols on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 min-[360px]:gap-2.5 sm:gap-3.5">
        <div className="p-2.5 min-[360px]:p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-1.5 min-[360px]:gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Total Accounts</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-slate-900 mt-0.5 truncate">
              {metrics.totalCustomers}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-emerald-600">
                ({metrics.activeCount} Active)
              </span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-1.5 min-[360px]:gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Outstanding Dues</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-rose-600 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.totalDuesPaise)}
            </p>
            <p className="text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-normal text-slate-400 mt-0.5 truncate">
              {metrics.customersWithDues} accounts due
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-1.5 min-[360px]:gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Advance Collected</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-emerald-600 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.totalAdvancePaise)}
            </p>
            <p className="text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-normal text-slate-400 mt-0.5 truncate">
              {metrics.settledCount} accounts settled
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-1.5 min-[360px]:gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Delivery Routes</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-slate-900 mt-0.5 truncate">
              {metrics.routeCount}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-slate-500">Active</span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Scrollable Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {(['all', 'active', 'inactive'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setStatusFilter(mode);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs capitalize transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === mode
                    ? 'bg-blue-600 text-white font-medium shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button variant="primary" size="sm" onClick={onAddCustomer}>
            <Plus className="w-3.5 h-3.5" /> Add Customer
          </Button>
        </div>

        {/* Dropdowns Row & View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Route Filter Dropdown */}
            <select
              value={routeFilter}
              onChange={(e) => {
                setRouteFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
            >
              <option value="all">All Routes ({routes.length - 1})</option>
              {routes
                .filter((r) => r !== 'all')
                .map((r) => (
                  <option key={r} value={r}>
                    Route: {r}
                  </option>
                ))}
            </select>

            {/* Balance Filter Dropdown */}
            <select
              value={balanceFilter}
              onChange={(e) => {
                setBalanceFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
            >
              <option value="all">All Balances</option>
              <option value="dues">Outstanding Dues Only</option>
              <option value="settled">Settled Accounts (₹0)</option>
              <option value="advance">Advance Balances Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-normal hidden sm:inline">
              Showing {filteredRows.length} accounts
            </span>

            {/* Layout Toggle (Desktop / Tablet) */}
            <div className="hidden md:flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('adaptive')}
                title="Adaptive Mobile/Desktop View"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'adaptive'
                    ? 'bg-white text-slate-800 shadow-2xs font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Auto
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Card Grid View"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-800 shadow-2xs font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Full Table View"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-800 shadow-2xs font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE CARDS VIEW (Visible on mobile screens or when card view mode is active) */}
      <div
        className={`space-y-3 ${
          viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'block md:hidden'
        }`}
      >
        {paginatedRows.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No customers match the current filter.
          </div>
        ) : (
          paginatedRows.map((c) => {
            const initials =
              (c.name || '')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'CU';

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-3 min-[360px]:p-4 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                {/* Customer Header */}
                <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-[360px]:gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-semibold text-xs shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="font-semibold text-xs min-[360px]:text-sm text-slate-900 truncate leading-tight">
                          {c.name}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {c.customer_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] min-[360px]:text-xs text-slate-500 mt-0.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.route_area || 'Direct Route'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Balance Pill */}
                  <div className="self-start min-[380px]:self-auto min-[380px]:text-right shrink-0">
                    {c.currentBalance > 0 ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{formatPaiseAsINR(c.currentBalance)} Due</span>
                      </div>
                    ) : c.currentBalance === 0 ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Settled</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{formatPaiseAsINR(Math.abs(c.currentBalance))} Adv</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Date Bar */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 gap-2">
                  {c.mobile ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <a
                        href={`tel:${c.mobile}`}
                        className="flex items-center gap-1 text-slate-700 font-mono hover:text-blue-600 truncate"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.mobile}</span>
                      </a>
                      <button
                        onClick={() =>
                          openWhatsAppShare({
                            mobile: c.mobile,
                            message: formatInvoiceWhatsAppMessage({
                              customerName: c.name,
                              amountPaise: c.currentBalance,
                            }),
                          })
                        }
                        title="Chat on WhatsApp"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 shrink-0 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 truncate">No mobile phone</span>
                  )}
                  <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 text-right">
                    Joined {formatDate(c.joining_date)}
                  </span>
                </div>

                {/* Touch-Friendly Primary Operations */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onRecordDelivery(c.id!)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/90 font-semibold text-xs transition-colors cursor-pointer active:scale-98 shadow-2xs whitespace-nowrap min-h-11"
                  >
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Delivery</span>
                  </button>
                  <button
                    onClick={() => onRecordPayment(c.id!)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 font-semibold text-xs transition-colors cursor-pointer active:scale-98 shadow-2xs whitespace-nowrap min-h-11"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Payment</span>
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => onViewCustomer(c)}
                    className="text-blue-600 font-medium hover:underline flex items-center gap-1 py-1 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Profile
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onEditCustomer(c)}
                      className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    {onDeleteCustomer && (
                      <button
                        onClick={() => setCustomerToDelete(c)}
                        title="Delete Customer"
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP MODERN TAILWIND TABLE (Visible on >= md screens) */}
      <div
        className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden ${
          viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th
                  onClick={() => handleToggleSort('code')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Code</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer Details</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Contact</th>
                <th
                  onClick={() => handleToggleSort('date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Joining Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort('balance')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Account Balance</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customer accounts match your search or filter.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((c) => {
                  const initials =
                    (c.name || '')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'CU';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onViewCustomer(c)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {c.customer_code}
                        </span>
                      </td>

                      {/* Name & Route */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-semibold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                              {c.name}
                            </p>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{c.route_area || 'Direct Route'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        {c.mobile ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-700">{c.mobile}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openWhatsAppShare({
                                  mobile: c.mobile,
                                  message: formatInvoiceWhatsAppMessage({
                                    customerName: c.name,
                                    amountPaise: c.currentBalance,
                                  }),
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-600"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Joining Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-normal">
                        {formatDate(c.joining_date)}
                      </td>

                      {/* Balance */}
                      <td className="py-3.5 px-4">
                        {c.currentBalance > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            {formatPaiseAsINR(c.currentBalance)} Due
                          </span>
                        ) : c.currentBalance === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Settled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <TrendingDown className="w-3 h-3 text-emerald-500" />
                            {formatPaiseAsINR(Math.abs(c.currentBalance))} Adv
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            c.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {c.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onRecordDelivery(c.id!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Delivery</span>
                          </button>
                          <button
                            onClick={() => onRecordPayment(c.id!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay</span>
                          </button>
                          <button
                            onClick={() => onEditCustomer(c)}
                            title="Edit Customer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteCustomer && (
                            <button
                              onClick={() => setCustomerToDelete(c)}
                              title="Delete Customer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Touch-Friendly Responsive Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-xs">
          <div className="text-slate-500 font-normal">
            Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span> (
            {filteredRows.length} total)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Customer Move to Bin Confirmation Modal */}
      {customerToDelete && (
        <Modal
          isOpen={!!customerToDelete}
          onClose={() => !isDeleting && setCustomerToDelete(null)}
          title="Move Customer to Bin"
          subtitle="Move customer to the Recycle Bin with full restore capability"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-950">
                  Move this customer to the Recycle Bin?
                </p>
                <p className="text-amber-800 leading-relaxed">
                  <strong>{customerToDelete.name} ({customerToDelete.customer_code})</strong> will be moved to the Recycle Bin and hidden from daily routes. All historical ledger entries, balances, and payment records remain completely safe and can be restored anytime from the Recycle Bin in the sidebar.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-semibold text-slate-800">{customerToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Code:</span>
                <span className="font-mono text-slate-800">{customerToDelete.customer_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-mono text-slate-800">{customerToDelete.mobile || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route / Area:</span>
                <span className="text-slate-800">{customerToDelete.route_area || 'Direct'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setCustomerToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={isDeleting}
                onClick={async () => {
                  if (!customerToDelete?.id || !onDeleteCustomer) return;
                  try {
                    setIsDeleting(true);
                    await onDeleteCustomer(customerToDelete.id);
                    setCustomerToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                Move to Bin
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
