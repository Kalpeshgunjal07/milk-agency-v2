import React, { useMemo, useState } from 'react';
import { CustomerRecord, LedgerEntryInput, LedgerEntryRecord } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatPaiseAsINR, parseRupeesToPaise } from '../../lib/calculations/money';
import { formatDateTime } from '../../lib/formatters/date';
import {
  Plus,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Truck,
  CreditCard,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface LedgerViewProps {
  ledgerEntries: LedgerEntryRecord[];
  customers: CustomerRecord[];
  onAddAdjustment: (entry: LedgerEntryInput) => Promise<void>;
  searchQuery: string;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  ledgerEntries,
  customers,
  onAddAdjustment,
  searchQuery,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentCustId, setAdjustmentCustId] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'discount' | 'charge'>('discount');
  const [adjustmentAmountRupees, setAdjustmentAmountRupees] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  const filteredRows = useMemo(() => {
    return ledgerEntries
      .filter((l) => {
        if (selectedCustomerId !== 'all' && l.customer_id.toString() !== selectedCustomerId) {
          return false;
        }
        if (typeFilter !== 'all' && l.transaction_type !== typeFilter) {
          return false;
        }
        const cust = customers.find((c) => c.id === l.customer_id);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const name = cust?.name.toLowerCase() || '';
          const desc = l.description.toLowerCase();
          return name.includes(q) || desc.includes(q);
        }
        return true;
      })
      .map((l) => {
        const cust = customers.find((c) => c.id === l.customer_id);
        return {
          ...l,
          customerName: cust?.name || `Customer #${l.customer_id}`,
          customerCode: cust?.customer_code || '',
        };
      });
  }, [ledgerEntries, customers, selectedCustomerId, typeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const totalDebits = filteredRows.reduce((sum, r) => sum + r.debit_amount, 0);
    const totalCredits = filteredRows.reduce((sum, r) => sum + r.credit_amount, 0);
    const netReceivable = totalDebits - totalCredits;

    return {
      totalEntries: filteredRows.length,
      totalDebits,
      totalCredits,
      netReceivable,
    };
  }, [filteredRows]);

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentCustId || !adjustmentAmountRupees || !adjustmentReason.trim()) return;

    setIsSubmitting(true);
    try {
      const amountPaise = parseRupeesToPaise(adjustmentAmountRupees);
      const isDiscount = adjustmentType === 'discount';

      await onAddAdjustment({
        customer_id: parseInt(adjustmentCustId, 10),
        transaction_type: 'adjustment',
        description: `Adjustment: ${adjustmentReason.trim()} (${isDiscount ? 'Discount' : 'Extra Charge'})`,
        debit_amount: isDiscount ? 0 : amountPaise,
        credit_amount: isDiscount ? amountPaise : 0,
        running_balance: 0,
      });

      setIsAdjustmentModalOpen(false);
      setAdjustmentAmountRupees('');
      setAdjustmentReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVoucherBadge = (type: string) => {
    if (type === 'delivery') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Truck className="w-3 h-3 text-blue-500" />
          Delivery
        </span>
      );
    }
    if (type === 'payment') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CreditCard className="w-3 h-3 text-emerald-500" />
          Payment
        </span>
      );
    }
    if (type === 'adjustment') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <SlidersHorizontal className="w-3 h-3 text-amber-500" />
          Adjust
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <Scale className="w-3 h-3 text-slate-500" />
        Opening
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 min-[360px]:gap-2.5 sm:gap-3.5">
        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Entries</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-slate-900 mt-0.5 truncate">
              {metrics.totalEntries}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-slate-400">Total</span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Debited (Sales)</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-rose-600 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.totalDebits)}
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Credited (Paid)</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-emerald-600 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.totalCredits)}
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Net Balance</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-slate-900 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.netReceivable)}
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs font-normal rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="all">All Accounts ({customers.length})</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customer_code})
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs font-normal rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="all">All Types</option>
              <option value="delivery">Delivery Sales</option>
              <option value="payment">Payments</option>
              <option value="adjustment">Adjustments</option>
              <option value="opening_balance">Opening Balance</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={() => setIsAdjustmentModalOpen(true)} className="w-full sm:w-auto min-h-10.5 justify-center">
            <Plus className="w-3.5 h-3.5" /> Post Adjustment
          </Button>
        </div>

        <div className="text-[11px] text-slate-400 font-normal pt-1 border-t border-slate-100">
          Showing {filteredRows.length} transactions
        </div>
      </div>

      {/* MOBILE LEDGER CARDS VIEW */}
      <div className="space-y-3 md:hidden">
        {paginatedRows.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No ledger entries found.
          </div>
        ) : (
          paginatedRows.map((l) => {
            const isDebit = l.debit_amount > 0;
            return (
              <div
                key={l.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-3 min-[360px]:p-4 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs min-[360px]:text-sm text-slate-900 leading-tight truncate">
                      {l.customerName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        {l.customerCode}
                      </span>
                      <span className="shrink-0">{renderVoucherBadge(l.transaction_type)}</span>
                    </div>
                  </div>

                  {/* Transaction Amount */}
                  <div className="text-right shrink-0 whitespace-nowrap">
                    {isDebit ? (
                      <span className="font-mono font-bold text-sm text-rose-600 block">
                        +{formatPaiseAsINR(l.debit_amount)}
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-sm text-emerald-600 block">
                        -{formatPaiseAsINR(l.credit_amount)}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-sans text-slate-400">
                      {isDebit ? 'Debited' : 'Credited'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-normal pt-1 border-t border-slate-100 truncate">
                  {l.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-100 gap-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] min-[360px]:text-[11px] truncate">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{formatDateTime(l.created_at)}</span>
                  </div>

                  <div className="shrink-0 whitespace-nowrap text-right">
                    <span className="text-[10px] text-slate-400 mr-1">Net:</span>
                    <span
                      className={`font-mono font-semibold text-xs ${
                        l.running_balance > 0
                          ? 'text-rose-600'
                          : l.running_balance < 0
                          ? 'text-emerald-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {formatPaiseAsINR(Math.abs(l.running_balance))}{' '}
                      {l.running_balance > 0 ? 'Due' : l.running_balance < 0 ? 'Adv' : 'Settled'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TAILWIND TABLE VIEW */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Voucher Type</th>
                <th className="py-3.5 px-4">Line Description</th>
                <th className="py-3.5 px-4 text-right">Debit (Dr)</th>
                <th className="py-3.5 px-4 text-right">Credit (Cr)</th>
                <th className="py-3.5 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No ledger transactions found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((l) => (
                  <tr key={l.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 font-normal">
                      {formatDateTime(l.created_at)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {l.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {l.customerCode}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{renderVoucherBadge(l.transaction_type)}</td>

                    <td className="py-3.5 px-4 text-slate-700 font-normal max-w-xs truncate">
                      {l.description}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {l.debit_amount > 0 ? (
                        <span className="font-mono font-semibold text-rose-600">
                          +{formatPaiseAsINR(l.debit_amount)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {l.credit_amount > 0 ? (
                        <span className="font-mono font-semibold text-emerald-600">
                          -{formatPaiseAsINR(l.credit_amount)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-mono font-bold ${
                          l.running_balance > 0
                            ? 'text-rose-600'
                            : l.running_balance < 0
                            ? 'text-emerald-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {formatPaiseAsINR(Math.abs(l.running_balance))}{' '}
                        <span className="text-[10px] uppercase font-sans font-medium">
                          {l.running_balance > 0 ? 'Due' : l.running_balance < 0 ? 'Adv' : ''}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-xs">
          <div className="text-slate-500 font-normal">
            Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
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

      {/* Manual Adjustment Modal */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Add Manual Ledger Adjustment"
        subtitle="Post a credit discount or extra debit charge directly to customer ledger"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          <Select
            label="Customer"
            value={adjustmentCustId}
            onChange={(e) => setAdjustmentCustId(e.target.value)}
            required
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.customer_code})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Select
              label="Adjustment Nature"
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as any)}
            >
              <option value="discount">Credit (Discount / Waiver)</option>
              <option value="charge">Debit (Extra Surcharge / Correction)</option>
            </Select>

            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 50.00"
              value={adjustmentAmountRupees}
              onChange={(e) => setAdjustmentAmountRupees(e.target.value)}
              required
            />
          </div>

          <Input
            label="Reason / Notes"
            placeholder="e.g. Festival concession or milk return waiver"
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
            required
          />

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdjustmentModalOpen(false)}
              className="w-full sm:w-auto min-h-11 justify-center"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full sm:w-auto min-h-11 justify-center">
              Commit Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
