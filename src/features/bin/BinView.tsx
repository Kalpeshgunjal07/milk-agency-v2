import React, { useMemo, useState } from 'react';
import { CustomerRecord, LedgerEntryRecord, ProductRecord } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatPaiseAsINR } from '../../lib/calculations/money';
import { formatDate } from '../../lib/formatters/date';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Users,
  Package,
  Milk,
  AlertCircle,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Phone,
} from 'lucide-react';

interface BinViewProps {
  customers: CustomerRecord[];
  products: ProductRecord[];
  ledgerEntries: LedgerEntryRecord[];
  onRestoreCustomer: (id: number) => Promise<void>;
  onPermanentDeleteCustomer: (id: number) => Promise<void>;
  onRestoreProduct: (id: number) => Promise<void>;
  onPermanentDeleteProduct: (id: number) => Promise<void>;
  onEmptyBin?: () => Promise<void>;
  searchQuery: string;
}

export const BinView: React.FC<BinViewProps> = ({
  customers,
  products,
  ledgerEntries,
  onRestoreCustomer,
  onPermanentDeleteCustomer,
  onRestoreProduct,
  onPermanentDeleteProduct,
  onEmptyBin,
  searchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'products'>('customers');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Modals for permanent deletion
  const [customerToPurge, setCustomerToPurge] = useState<CustomerRecord | null>(null);
  const [productToPurge, setProductToPurge] = useState<ProductRecord | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  // Deleted Customers
  const deletedCustomers = useMemo(() => {
    return customers
      .filter((c) => !!c.deleted_at)
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

  // Deleted Products
  const deletedProducts = useMemo(() => {
    return products.filter((p) => !!p.deleted_at);
  }, [products]);

  // Filtered rows
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return deletedCustomers;
    const q = searchQuery.toLowerCase();
    return deletedCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.customer_code.toLowerCase().includes(q) ||
        (c.mobile && c.mobile.includes(q)) ||
        (c.route_area && c.route_area.toLowerCase().includes(q))
    );
  }, [deletedCustomers, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return deletedProducts;
    const q = searchQuery.toLowerCase();
    return deletedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.product_code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [deletedProducts, searchQuery]);

  // Overall metrics
  const metrics = useMemo(() => {
    const totalDeleted = deletedCustomers.length + deletedProducts.length;
    const totalDues = deletedCustomers
      .filter((c) => c.currentBalance > 0)
      .reduce((sum, c) => sum + c.currentBalance, 0);

    return {
      totalDeleted,
      customerCount: deletedCustomers.length,
      productCount: deletedProducts.length,
      totalDues,
    };
  }, [deletedCustomers, deletedProducts]);

  const handleRestoreCustomerClick = async (c: CustomerRecord) => {
    if (!c.id) return;
    try {
      setActionLoadingId(c.id);
      await onRestoreCustomer(c.id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestoreProductClick = async (p: ProductRecord) => {
    if (!p.id) return;
    try {
      setActionLoadingId(p.id);
      await onRestoreProduct(p.id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDeletedDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })} at ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return formatDate(dateStr);
    }
  };

  return (
    <div className="space-y-4">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 min-[360px]:gap-2.5 sm:gap-3.5">
        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Total in Bin</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-slate-900 mt-0.5 truncate">
              {metrics.totalDeleted}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-slate-400">Items</span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Deleted Customers</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-blue-600 mt-0.5 truncate">
              {metrics.customerCount}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-slate-400">Accounts</span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Deleted Products</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-indigo-600 mt-0.5 truncate">
              {metrics.productCount}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-slate-400">SKUs</span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Preserved Balances</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-rose-600 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.totalDues)}
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher & Safe Restore Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 w-fit">
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Deleted Customers</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono">
                {deletedCustomers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Deleted Dairy Products</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono">
                {deletedProducts.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex text-xs text-slate-400 items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Restoring brings back all ledger & delivery records</span>
            </div>
            {metrics.totalDeleted > 0 && onEmptyBin && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (
                    confirm(
                      'PERMANENT ACTION:\n\nAre you sure you want to empty the Recycle Bin?\n\nAll deleted customers and products will be permanently erased.'
                    )
                  ) {
                    onEmptyBin();
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Empty Bin
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* TAB CONTENT: DELETED CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-3">
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No deleted customers in the recycle bin.
              </div>
            ) : (
              filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm text-slate-900 leading-tight truncate">
                          {c.name}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {c.customer_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.route_area || 'Direct Route'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 whitespace-nowrap">
                      {c.currentBalance !== 0 ? (
                        <span
                          className={`font-mono font-semibold text-xs ${
                            c.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {formatPaiseAsINR(Math.abs(c.currentBalance))}{' '}
                          {c.currentBalance > 0 ? 'Due' : 'Adv'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Settled</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 gap-2">
                    <span className="flex items-center gap-1 min-w-0 flex-1 truncate">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">Deleted {formatDeletedDate(c.deleted_at)}</span>
                    </span>
                    {c.mobile && <span className="font-mono shrink-0">{c.mobile}</span>}
                  </div>

                  {/* Actions: Restore & Permanent Delete */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleRestoreCustomerClick(c)}
                      disabled={actionLoadingId === c.id}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-11 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 font-medium text-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{actionLoadingId === c.id ? 'Restoring...' : 'Restore'}</span>
                    </button>
                    <button
                      onClick={() => setCustomerToPurge(c)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-11 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Forever</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Ledger Balance</th>
                    <th className="py-3.5 px-4">Deleted On</th>
                    <th className="py-3.5 px-4 text-right">Bin Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No deleted customers in the recycle bin.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-700">{c.customer_code}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900 leading-tight">{c.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {c.route_area || 'Direct Route'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{c.mobile || '—'}</td>
                        <td className="py-3.5 px-4">
                          {c.currentBalance !== 0 ? (
                            <span
                              className={`font-mono font-semibold ${
                                c.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {formatPaiseAsINR(Math.abs(c.currentBalance))}{' '}
                              {c.currentBalance > 0 ? 'Due' : 'Adv'}
                            </span>
                          ) : (
                            <span className="text-slate-400">Settled</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {formatDeletedDate(c.deleted_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestoreCustomerClick(c)}
                              disabled={actionLoadingId === c.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{actionLoadingId === c.id ? 'Restoring...' : 'Restore'}</span>
                            </button>
                            <button
                              onClick={() => setCustomerToPurge(c)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Forever</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DELETED PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No deleted products in the recycle bin.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isMilk = p.category.toLowerCase().includes('milk');
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isMilk
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                        >
                          {isMilk ? <Milk className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-sm text-slate-900 leading-tight truncate">
                              {p.name}
                            </h3>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              {p.product_code}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate">{p.category}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs text-blue-700 block">
                          {formatPaiseAsINR(p.default_selling_price)}
                        </span>
                        <span className="text-[10px] text-slate-400">/ {p.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 truncate">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">Deleted {formatDeletedDate(p.deleted_at)}</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleRestoreProductClick(p)}
                        disabled={actionLoadingId === p.id}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-11 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 font-medium text-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{actionLoadingId === p.id ? 'Restoring...' : 'Restore'}</span>
                      </button>
                      <button
                        onClick={() => setProductToPurge(p)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-11 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 font-medium text-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Forever</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-3.5 px-4">SKU Code</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Unit & Rate</th>
                    <th className="py-3.5 px-4">Deleted On</th>
                    <th className="py-3.5 px-4 text-right">Bin Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No deleted dairy products in the recycle bin.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-700">{p.product_code}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{p.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-blue-700">
                          {formatPaiseAsINR(p.default_selling_price)} / {p.unit}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {formatDeletedDate(p.deleted_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestoreProductClick(p)}
                              disabled={actionLoadingId === p.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{actionLoadingId === p.id ? 'Restoring...' : 'Restore'}</span>
                            </button>
                            <button
                              onClick={() => setProductToPurge(p)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Forever</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PERMANENT PURGE CUSTOMER */}
      {customerToPurge && (
        <Modal
          isOpen={!!customerToPurge}
          onClose={() => !isPurging && setCustomerToPurge(null)}
          title="Permanently Delete Customer"
          subtitle="WARNING: Irreversible action. Record cannot be restored."
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-950">
                  Delete {customerToPurge.name} forever?
                </p>
                <p className="text-rose-800 leading-relaxed">
                  This will <strong>permanently purge</strong> this customer and erase all linked delivery schedules, daily delivery records, customer ledger entries, and payment receipts from your local SQLite database.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-800">{customerToPurge.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Code:</span>
                <span className="font-mono text-slate-800">{customerToPurge.customer_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deleted On:</span>
                <span className="text-slate-800">{formatDeletedDate(customerToPurge.deleted_at)}</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                disabled={isPurging}
                onClick={() => setCustomerToPurge(null)}
                className="w-full sm:w-auto min-h-11 justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={isPurging}
                className="w-full sm:w-auto min-h-11 justify-center"
                onClick={async () => {
                  if (!customerToPurge.id) return;
                  try {
                    setIsPurging(true);
                    await onPermanentDeleteCustomer(customerToPurge.id);
                    setCustomerToPurge(null);
                  } finally {
                    setIsPurging(false);
                  }
                }}
              >
                Yes, Purge Forever
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: PERMANENT PURGE PRODUCT */}
      {productToPurge && (
        <Modal
          isOpen={!!productToPurge}
          onClose={() => !isPurging && setProductToPurge(null)}
          title="Permanently Delete Product"
          subtitle="WARNING: Irreversible action. Record cannot be restored."
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-950">
                  Delete {productToPurge.name} forever?
                </p>
                <p className="text-rose-800 leading-relaxed">
                  This will <strong>permanently purge</strong> this product SKU ({productToPurge.product_code}) from the database. Any historical delivery records referencing it will be cleared.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Product SKU:</span>
                <span className="font-semibold text-slate-800">{productToPurge.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Code:</span>
                <span className="font-mono text-slate-800">{productToPurge.product_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deleted On:</span>
                <span className="text-slate-800">{formatDeletedDate(productToPurge.deleted_at)}</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                disabled={isPurging}
                onClick={() => setProductToPurge(null)}
                className="w-full sm:w-auto min-h-11 justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={isPurging}
                className="w-full sm:w-auto min-h-11 justify-center"
                onClick={async () => {
                  if (!productToPurge.id) return;
                  try {
                    setIsPurging(true);
                    await onPermanentDeleteProduct(productToPurge.id);
                    setProductToPurge(null);
                  } finally {
                    setIsPurging(false);
                  }
                }}
              >
                Yes, Purge Forever
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
