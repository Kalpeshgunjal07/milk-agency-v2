import React from 'react';
import {
  Users,
  Package,
  Truck,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  Send,
  Plus,
  UserPlus,
} from 'lucide-react';
import {
  CustomerRecord,
  ProductRecord,
  DeliveryRecord,
  PaymentRecord,
  LedgerEntryRecord,
} from '../../types/models';
import { formatPaiseAsINR } from '../../lib/calculations/money';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { openWhatsAppShare, formatInvoiceWhatsAppMessage } from '../../lib/whatsapp/share';
import { ViewName } from '../../types/enums';

interface DashboardViewProps {
  customers: CustomerRecord[];
  products: ProductRecord[];
  deliveries: DeliveryRecord[];
  payments: PaymentRecord[];
  ledgerEntries: LedgerEntryRecord[];
  onNavigate: (view: ViewName) => void;
  onAddDelivery: () => void;
  onAddPayment: () => void;
  onAddCustomer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  products,
  deliveries,
  payments,
  ledgerEntries,
  onNavigate,
  onAddDelivery,
  onAddPayment,
  onAddCustomer,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Active Customers
  const activeCustomersCount = customers.filter((c) => c.status === 'active' && !c.deleted_at).length;

  // Today's Deliveries
  const todayDeliveries = deliveries.filter((d) => d.delivery_date === todayStr);
  const todayDeliveriesCount = todayDeliveries.length;
  const todaySalesPaise = todayDeliveries.reduce((sum, d) => sum + (d.total_amount || 0), 0);

  // Today's Payments
  const todayPayments = payments.filter((p) => p.payment_date === todayStr);
  const todayCollectionsPaise = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Total Customer Outstanding
  const customerBalances = customers
    .filter((c) => !c.deleted_at)
    .map((c) => {
      const custEntries = ledgerEntries.filter((l) => l.customer_id === c.id);
      const balance = custEntries.length ? custEntries[custEntries.length - 1].running_balance : c.opening_balance;
      return { customer: c, balance };
    });

  const totalOutstandingPaise = customerBalances.reduce((sum, cb) => (cb.balance > 0 ? sum + cb.balance : sum), 0);

  // Month-to-date metrics
  const currentMonthPrefix = todayStr.slice(0, 7);
  const monthDeliveries = deliveries.filter((d) => d.delivery_date.startsWith(currentMonthPrefix));
  const monthSalesPaise = monthDeliveries.reduce((sum, d) => sum + (d.total_amount || 0), 0);
  const monthPayments = payments.filter((p) => p.payment_date.startsWith(currentMonthPrefix));
  const monthCollectionsPaise = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Top Defaulters
  const topDefaulters = [...customerBalances]
    .filter((cb) => cb.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  // Chart Data: Past 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().slice(0, 10);
    const dayDeliveries = deliveries.filter((del) => del.delivery_date === dStr);
    const dayPayments = payments.filter((p) => p.payment_date === dStr);
    const daySales = dayDeliveries.reduce((acc, del) => acc + (del.total_amount || 0), 0) / 100;
    const dayCollections = dayPayments.reduce((acc, p) => acc + (p.amount || 0), 0) / 100;

    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      sales: daySales,
      collections: dayCollections,
    };
  });

  const handleSendReminder = (customer: CustomerRecord, balancePaise: number) => {
    const message = formatInvoiceWhatsAppMessage({
      customerName: customer.name,
      amountPaise: balancePaise,
    });
    openWhatsAppShare(customer.mobile, message);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top 3 Quick Action Buttons (Responsive on Mobile & Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        <button
          type="button"
          onClick={onAddDelivery}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-11"
        >
          <Truck className="w-4 h-4 shrink-0" />
          <span className="truncate">Record Delivery</span>
        </button>

        <button
          type="button"
          onClick={onAddPayment}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-11"
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span className="truncate">Receive Pay</span>
        </button>

        <button
          type="button"
          onClick={onAddCustomer}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-11"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span className="truncate">Add Customer</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Active Customers */}
        <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-normal text-slate-500 truncate">Active Customers</p>
            <p className="text-base sm:text-xl font-semibold text-slate-800 mt-0.5 truncate">{activeCustomersCount}</p>
            <span className="text-[11px] text-blue-600 font-normal truncate block">Local SQLite</span>
          </div>
          <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Today's Sales */}
        <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-normal text-slate-500 truncate">Today's Sales</p>
            <p className="text-base sm:text-xl font-semibold text-slate-800 mt-0.5 font-mono truncate">{formatPaiseAsINR(todaySalesPaise)}</p>
            <span className="text-[11px] text-slate-400 font-normal truncate block">{todayDeliveriesCount} deliveries</span>
          </div>
          <div className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Today's Collections */}
        <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-normal text-slate-500 truncate">Today's Collected</p>
            <p className="text-base sm:text-xl font-semibold text-emerald-600 mt-0.5 font-mono truncate">{formatPaiseAsINR(todayCollectionsPaise)}</p>
            <span className="text-[11px] text-emerald-600 font-normal truncate block">{todayPayments.length} receipts</span>
          </div>
          <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-normal text-slate-500 truncate">Total Outstanding</p>
            <p className="text-base sm:text-xl font-semibold text-rose-600 mt-0.5 font-mono truncate">{formatPaiseAsINR(totalOutstandingPaise)}</p>
            <span className="text-[11px] text-rose-500 font-normal truncate block">Customer dues</span>
          </div>
          <div className="p-2 sm:p-2.5 bg-rose-50 text-rose-600 rounded-lg shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Second Row: Month Overview & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Month Progress Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Current Month Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-normal">Month-to-Date Sales</span>
              <span className="font-medium text-slate-800">{formatPaiseAsINR(monthSalesPaise)}</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 font-normal">Month Collections</span>
              <span className="font-medium text-emerald-600">{formatPaiseAsINR(monthCollectionsPaise)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-normal">Total Dairy SKUs</span>
              <span className="font-medium text-slate-800">{products.length} Products</span>
            </div>
          </CardContent>
        </Card>

        {/* 7-Day Performance Chart */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-xs font-semibold">7-Day Sales vs Collections (₹)</CardTitle>
              <div className="flex items-center gap-4 text-xs font-normal">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> Sales
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" /> Collections
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-44 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', fontFamily: 'Poppins' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={1.5} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="collections" stroke="#059669" strokeWidth={1.5} fillOpacity={1} fill="url(#colGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Third Row: Top Defaulters & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Outstanding Customers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Highest Outstanding Accounts</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('ledger')}>
                View Ledger
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {topDefaulters.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-normal">No overdue customer accounts! 🎉</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topDefaulters.map(({ customer, balance }) => (
                  <div key={customer.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50/60">
                    <div>
                      <p className="text-xs font-medium text-slate-800">{customer.name}</p>
                      <p className="text-[11px] text-slate-400 font-normal">{customer.route_area || 'Route'} • {customer.mobile || 'No Mobile'}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-medium text-rose-600 font-mono">
                        {formatPaiseAsINR(balance)}
                      </span>
                      {customer.mobile && (
                        <button
                          onClick={() => handleSendReminder(customer, balance)}
                          title="Send WhatsApp Reminder"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-semibold">Quick Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <button
              onClick={onAddDelivery}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-800">Record Today's Morning Deliveries</p>
                  <p className="text-[11px] text-slate-400 font-normal">Bulk delivery grid with schedule auto-fill</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={onAddPayment}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-800">Receive Customer Payment</p>
                  <p className="text-[11px] text-slate-400 font-normal">Instant credit to ledger with WhatsApp receipt</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button
              onClick={() => onNavigate('billing')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-800">Generate Monthly Bills</p>
                  <p className="text-[11px] text-slate-400 font-normal">Previous month or custom date-range PDF bills</p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
