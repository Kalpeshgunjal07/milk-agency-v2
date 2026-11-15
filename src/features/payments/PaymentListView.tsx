import React, { useMemo, useState } from 'react';
import {
  AgencySettings,
  CustomerRecord,
  LedgerEntryRecord,
  PaymentRecord,
} from '../../types/models';
import { Button } from '../../components/ui/Button';
import { formatPaiseAsINR } from '../../lib/calculations/money';
import { formatDate } from '../../lib/formatters/date';
import { AGENCY_LOGO_BASE64 } from '../../lib/logoBase64';
import { generatePaymentReceiptImageBlob } from '../../lib/receiptImage';
import {
  formatPaymentWhatsAppMessage,
  shareImageOnWhatsApp,
  openWhatsAppShare,
} from '../../lib/whatsapp/share';
import {
  Plus,
  Send,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Calendar,
  Receipt,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Loader2,
} from 'lucide-react';

interface PaymentListViewProps {
  payments: PaymentRecord[];
  customers: CustomerRecord[];
  ledgerEntries?: LedgerEntryRecord[];
  agencySettings?: AgencySettings | null;
  onAddPayment: () => void;
  onEditPayment?: (payment: PaymentRecord) => void;
  searchQuery: string;
}

export const PaymentListView: React.FC<PaymentListViewProps> = ({
  payments,
  customers,
  ledgerEntries,
  agencySettings,
  onAddPayment,
  onEditPayment,
  searchQuery,
}) => {
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [sharingPaymentId, setSharingPaymentId] = useState<number | null>(null);

  // Metrics computation
  const metrics = useMemo(() => {
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const cashTotal = payments
      .filter((p) => p.payment_method === 'cash')
      .reduce((sum, p) => sum + p.amount, 0);
    const upiTotal = payments
      .filter((p) => p.payment_method === 'upi')
      .reduce((sum, p) => sum + p.amount, 0);
    const bankTotal = payments
      .filter((p) => p.payment_method === 'bank_transfer')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalReceipts: payments.length,
      totalCollected,
      cashTotal,
      upiTotal,
      bankTotal,
    };
  }, [payments]);

  const filteredRows = useMemo(() => {
    return payments
      .filter((p) => {
        if (methodFilter !== 'all' && p.payment_method !== methodFilter) return false;
        const cust = customers.find((c) => c.id === p.customer_id);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const name = cust?.name.toLowerCase() || '';
          const ref = p.reference_no?.toLowerCase() || '';
          return name.includes(q) || ref.includes(q);
        }
        return true;
      })
      .map((p) => {
        const cust = customers.find((c) => c.id === p.customer_id);
        return {
          ...p,
          customerName: cust?.name || `Customer #${p.customer_id}`,
          customerCode: cust?.customer_code || '',
          customerMobile: cust?.mobile,
          customerArea: cust?.route_area || 'Direct',
        };
      });
  }, [payments, customers, methodFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const renderMethodBadge = (mode: string) => {
    if (mode === 'cash') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Banknote className="w-3 h-3 text-emerald-500" />
          Cash
        </span>
      );
    }
    if (mode === 'upi') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Smartphone className="w-3 h-3 text-indigo-500" />
          UPI / QR
        </span>
      );
    }
    if (mode === 'bank_transfer') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Building className="w-3 h-3 text-blue-500" />
          Bank
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <CreditCard className="w-3 h-3 text-slate-500" />
        {mode}
      </span>
    );
  };

  const handleShareWhatsApp = async (p: any) => {
    if (!p.customerMobile) {
      alert(`No mobile number registered for ${p.customerName}`);
      return;
    }
    setSharingPaymentId(p.id);
    try {
      const custLedger = (ledgerEntries || []).filter((l) => l.customer_id === p.customer_id);
      const paymentEntry = custLedger.find(
        (l) => l.related_entity_type === 'payments' && l.related_entity_id === p.id
      );

      let closingBal = 0;
      let prevBal = 0;

      if (paymentEntry) {
        closingBal = paymentEntry.running_balance;
        prevBal = closingBal + p.amount;
      } else {
        const custObj = customers.find((c) => c.id === p.customer_id);
        const latestBal = custLedger.length
          ? custLedger[custLedger.length - 1].running_balance
          : (custObj?.opening_balance ?? 0);
        closingBal = latestBal;
        prevBal = closingBal + p.amount;
      }

      const effectiveAgencyName = agencySettings?.agency_name || 'Satvik Milk Agency';
      const effectiveLogo = agencySettings?.logo_path || AGENCY_LOGO_BASE64;
      const dateStr = p.payment_date.replace(/-/g, '');
      const receiptCode = `RCP-PAY-${dateStr}-${p.customerCode || p.customer_id}`;
      const headerColor = agencySettings?.receipt_header_color || '#00A8E8';

      const message = formatPaymentWhatsAppMessage({
        customerName: p.customerName,
        agencyName: effectiveAgencyName,
        agencyBrandLine: agencySettings?.receipt_brand_line,
        agencyPhone: agencySettings?.mobile,
        paymentAmountPaise: p.amount,
        paymentMethod: p.payment_method,
        paymentDate: formatDate(p.payment_date),
        receiptNo: receiptCode,
        referenceNo: p.reference_no,
        previousBalancePaise: prevBal,
        closingBalancePaise: closingBal,
        notes: p.notes,
      });

      const imageBlob = await generatePaymentReceiptImageBlob({
        agencyName: effectiveAgencyName,
        agencyAddress: agencySettings?.address,
        agencyMobile: agencySettings?.mobile,
        receiptBrandLine: agencySettings?.receipt_brand_line,
        receiptGst: agencySettings?.receipt_gst,
        logoBase64: effectiveLogo,
        receiptNo: receiptCode,
        date: formatDate(p.payment_date),
        customerName: p.customerName,
        customerCode: p.customerCode,
        customerMobile: p.customerMobile,
        paymentAmount: p.amount,
        paymentMethod: p.payment_method,
        referenceNo: p.reference_no,
        previousBalance: prevBal,
        closingBalance: closingBal,
        notes: p.notes,
        footerNote: agencySettings?.default_receipt_footer,
        headerColor,
      });

      await shareImageOnWhatsApp({
        mobile: p.customerMobile,
        message,
        imageBlob,
        fileName: `${receiptCode}.png`,
      });
    } catch (err) {
      console.error('Failed to share payment receipt image:', err);
      if (p.customerMobile) {
        openWhatsAppShare(p.customerMobile);
      }
    } finally {
      setSharingPaymentId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Total Collected</p>
            <p className="text-base sm:text-lg font-semibold text-emerald-600 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.totalCollected)}
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Cash Counter</p>
            <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.cashTotal)}
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">UPI / QR Code</p>
            <p className="text-base sm:text-lg font-semibold text-indigo-600 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.upiTotal)}
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Receipts</p>
            <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5 truncate">
              {metrics.totalReceipts}{' '}
              <span className="text-xs font-normal text-slate-400">Vouchers</span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Scrollable Mode Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {['all', 'cash', 'upi', 'bank_transfer'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMethodFilter(m);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  methodFilter === m
                    ? 'bg-emerald-600 text-white font-medium shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal'
                }`}
              >
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>

          <Button variant="success" size="sm" onClick={onAddPayment} className="w-full sm:w-auto min-h-10.5 justify-center">
            <Plus className="w-3.5 h-3.5" /> Receive Payment
          </Button>
        </div>

        <div className="text-[11px] text-slate-400 font-normal pt-1 border-t border-slate-100">
          Showing {filteredRows.length} payment receipts
        </div>
      </div>

      {/* MOBILE PAYMENT CARDS VIEW */}
      <div className="space-y-3 md:hidden">
        {paginatedRows.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No payments recorded yet.
          </div>
        ) : (
          paginatedRows.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-slate-900 leading-tight truncate">
                    {p.customerName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {p.customerCode}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{p.customerArea}</span>
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="text-right shrink-0 whitespace-nowrap">
                  <span className="font-mono font-bold text-base text-emerald-600 block">
                    +{formatPaiseAsINR(p.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {formatDate(p.payment_date)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {renderMethodBadge(p.payment_method)}
                  {p.reference_no && (
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate">
                      Ref: {p.reference_no}
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 truncate max-w-[110px] shrink-0 text-right">
                  {p.notes || 'Settlement'}
                </span>
              </div>

              {/* Actions: Edit & WhatsApp */}
              <div className="flex items-center gap-2 pt-1">
                {onEditPayment && (
                  <button
                    onClick={() => onEditPayment(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-11 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={() => handleShareWhatsApp(p)}
                  disabled={sharingPaymentId === p.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 font-medium text-xs border border-emerald-200 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {sharingPaymentId === p.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{sharingPaymentId === p.id ? 'Preparing...' : 'WhatsApp'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TAILWIND TABLE VIEW */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4">Payment Mode</th>
                <th className="py-3.5 px-4">UTR / Ref No</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 font-normal">
                      {formatDate(p.payment_date)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {p.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {p.customerCode} • {p.customerArea}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-600">
                        +{formatPaiseAsINR(p.amount)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{renderMethodBadge(p.payment_method)}</td>

                    <td className="py-3.5 px-4">
                      {p.reference_no ? (
                        <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {p.reference_no}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate font-normal">
                      {p.notes || 'Direct settlement'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onEditPayment && (
                          <button
                            onClick={() => onEditPayment(p)}
                            title="Edit Payment"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3 text-slate-500" />
                            <span>Edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleShareWhatsApp(p)}
                          disabled={sharingPaymentId === p.id}
                          title="Share via WhatsApp"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {sharingPaymentId === p.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                          ) : (
                            <Send className="w-3 h-3 text-emerald-600" />
                          )}
                          <span>{sharingPaymentId === p.id ? 'Sending...' : 'WhatsApp'}</span>
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
    </div>
  );
};
