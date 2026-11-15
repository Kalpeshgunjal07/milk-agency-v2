import React, { useState, useMemo, useEffect } from 'react';
import {
  AgencySettings,
  CustomerRecord,
  DeliveryInput,
  DeliveryRecord,
  DeliveryScheduleRecord,
  LedgerEntryRecord,
  PaymentRecord,
  ProductRecord,
} from '../../types/models';
import { Button } from '../../components/ui/Button';
import { formatPaiseAsINR, calculateLineAmountPaise } from '../../lib/calculations/money';
import { formatDate } from '../../lib/formatters/date';
import { pdf } from '@react-pdf/renderer';
import { DailyReceiptDocument } from '../../lib/pdf/receiptPdf';
import { generateReceiptImageBlob } from '../../lib/receiptImage';
import {
  openWhatsAppShare,
  shareImageOnWhatsApp,
  sharePdfOnWhatsApp,
  formatInvoiceWhatsAppMessage,
} from '../../lib/whatsapp/share';
import {
  Calendar,
  Printer,
  Save,
  Sun,
  Moon,
  Milk,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Plus,
  Minus,
  Check,
  X,
  FileImage,
  FileText,
  Loader2,
} from 'lucide-react';

interface DailyDeliveryViewProps {
  customers: CustomerRecord[];
  products: ProductRecord[];
  schedules: DeliveryScheduleRecord[];
  deliveries: DeliveryRecord[];
  payments?: PaymentRecord[];
  ledgerEntries?: LedgerEntryRecord[];
  agencySettings?: AgencySettings | null;
  onBatchConfirm: (batch: DeliveryInput[]) => Promise<void>;
  onGenerateReceipt: (delivery: any) => void;
  searchQuery: string;
}

interface GridDeliveryRow {
  customerId: number;
  customerCode: string;
  customerName: string;
  customerMobile?: string;
  routeArea: string;
  status: 'draft' | 'confirmed' | 'skipped';
  items: Record<number, number>; // productId -> quantity
  totalQuantity: number;
  totalAmountPaise: number;
  existingDeliveryId?: number;
}

export const DailyDeliveryView: React.FC<DailyDeliveryViewProps> = ({
  customers,
  products,
  schedules,
  deliveries,
  payments,
  ledgerEntries,
  agencySettings,
  onBatchConfirm,
  onGenerateReceipt,
  searchQuery,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [session, setSession] = useState<'morning' | 'evening'>('morning');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [rows, setRows] = useState<GridDeliveryRow[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [modifiedCustomerIds, setModifiedCustomerIds] = useState<Set<number>>(new Set());
  const [savingCustomerIds, setSavingCustomerIds] = useState<Set<number>>(new Set());
  const [receiptFormat, setReceiptFormat] = useState<'image' | 'pdf'>('image');
  const [sharingCustomerId, setSharingCustomerId] = useState<number | null>(null);

  // Available routes for filtering
  const routes = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.route_area) set.add(c.route_area);
    });
    return ['all', ...Array.from(set)];
  }, [customers]);

  // Active products to display as dynamic columns
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status === 'active' && !p.deleted_at);
  }, [products]);

  // Determine current day of week (mon, tue, wed, thu, fri, sat, sun)
  const currentWeekday = useMemo(() => {
    const d = new Date(selectedDate);
    const dayIndex = d.getDay();
    const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return map[dayIndex];
  }, [selectedDate]);

  // Load or auto-populate grid for selectedDate and session
  useEffect(() => {
    const existing = deliveries.filter(
      (d) => d.delivery_date === selectedDate && d.session_key === session
    );

    const generatedRows: GridDeliveryRow[] = customers
      .filter((c) => c.status === 'active' && !c.deleted_at)
      .map((c) => {
        const exist = existing.find((e) => e.customer_id === c.id);
        const itemMap: Record<number, number> = {};

        if (exist && exist.items && exist.items.length > 0) {
          exist.items.forEach((it) => {
            itemMap[it.product_id] = it.quantity;
          });
          return {
            customerId: c.id!,
            customerCode: c.customer_code,
            customerName: c.name,
            customerMobile: c.mobile,
            routeArea: c.route_area || 'Default',
            status: exist.status as any,
            items: itemMap,
            totalQuantity: exist.total_quantity,
            totalAmountPaise: exist.total_amount,
            existingDeliveryId: exist.id,
          };
        }

        // Auto-fill from active recurring schedules
        const custSchedules = schedules.filter((s) => {
          if (s.customer_id !== c.id || s.status !== 'active') {
            return false;
          }
          const days = s.delivery_days.toLowerCase().split(',').map((d) => d.trim());
          return days.includes(currentWeekday);
        });

        let totalQty = 0;
        let totalAmt = 0;

        custSchedules.forEach((sch) => {
          itemMap[sch.product_id] = sch.quantity;
          totalQty += sch.quantity;
          const prod = products.find((p) => p.id === sch.product_id);
          const rate = sch.custom_price || prod?.default_selling_price || 0;
          totalAmt += calculateLineAmountPaise(sch.quantity, rate);
        });

        return {
          customerId: c.id!,
          customerCode: c.customer_code,
          customerName: c.name,
          customerMobile: c.mobile,
          routeArea: c.route_area || 'Direct',
          status: totalQty > 0 ? 'draft' : 'skipped',
          items: itemMap,
          totalQuantity: parseFloat(totalQty.toFixed(2)),
          totalAmountPaise: totalAmt,
        };
      });

    setRows(generatedRows);
    setHasUnsavedChanges(false);
    setModifiedCustomerIds(new Set());
  }, [selectedDate, session, deliveries, customers, schedules, products, currentWeekday]);

  const handleQuantityChange = (customerId: number, productId: number, newQty: number) => {
    const validQty = Math.max(0, parseFloat(newQty.toFixed(2)) || 0);

    setRows((prev) =>
      prev.map((r) => {
        if (r.customerId !== customerId) return r;

        const nextItems = { ...r.items, [productId]: validQty };
        let nextTotalQty = 0;
        let nextTotalAmt = 0;

        Object.entries(nextItems).forEach(([pIdStr, qty]) => {
          const pId = Number(pIdStr);
          if (qty > 0) {
            nextTotalQty += qty;
            const sch = schedules.find((s) => s.customer_id === customerId && s.product_id === pId);
            const prod = products.find((p) => p.id === pId);
            const rate = sch?.custom_price || prod?.default_selling_price || 0;
            nextTotalAmt += calculateLineAmountPaise(qty, rate);
          }
        });

        return {
          ...r,
          items: nextItems,
          totalQuantity: parseFloat(nextTotalQty.toFixed(2)),
          totalAmountPaise: nextTotalAmt,
          status: nextTotalQty > 0 ? (r.status === 'skipped' ? 'draft' : r.status) : 'skipped',
        };
      })
    );
    setModifiedCustomerIds((prev) => new Set(prev).add(customerId));
    setHasUnsavedChanges(true);
  };

  const handleToggleRowStatus = (customerId: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.customerId !== customerId) return r;
        const nextStatus =
          r.status === 'confirmed' ? 'draft' : r.status === 'draft' ? 'skipped' : 'confirmed';
        return { ...r, status: nextStatus };
      })
    );
    setModifiedCustomerIds((prev) => new Set(prev).add(customerId));
    setHasUnsavedChanges(true);
  };

  const buildDeliveryPayload = (r: GridDeliveryRow): DeliveryInput => {
    const lineItems = Object.entries(r.items)
      .filter(([_, qty]) => qty > 0)
      .map(([pIdStr, qty]) => {
        const pId = Number(pIdStr);
        const prod = products.find((p) => p.id === pId);
        const sch = schedules.find(
          (s) => s.customer_id === r.customerId && s.product_id === pId
        );
        const rate = sch?.custom_price || prod?.default_selling_price || 0;
        return {
          customer_id: r.customerId,
          product_id: pId,
          product_name_snapshot: prod?.name || `Product #${pId}`,
          unit_snapshot: prod?.unit || 'Ltr',
          quantity: qty,
          unit_price: rate,
          line_amount: calculateLineAmountPaise(qty, rate),
        };
      });

    return {
      id: r.existingDeliveryId,
      customer_id: r.customerId,
      product_id: lineItems[0]?.product_id || 0,
      delivery_date: selectedDate,
      session_key: session,
      status: r.status === 'skipped' ? 'skipped' : 'confirmed',
      total_quantity: r.totalQuantity,
      total_amount: r.totalAmountPaise,
      items: lineItems,
    };
  };

  // Save single customer without touching any other customers
  const handleSaveSingleCustomer = async (customerId: number) => {
    const r = rows.find((row) => row.customerId === customerId);
    if (!r) return;

    setSavingCustomerIds((prev) => new Set(prev).add(customerId));
    try {
      const payload = buildDeliveryPayload(r);
      await onBatchConfirm([payload]);

      setModifiedCustomerIds((prev) => {
        const next = new Set(prev);
        next.delete(customerId);
        if (next.size === 0) {
          setHasUnsavedChanges(false);
        }
        return next;
      });

      setRows((prev) =>
        prev.map((row) =>
          row.customerId === customerId
            ? { ...row, status: row.status === 'skipped' ? 'skipped' : 'confirmed' }
            : row
        )
      );
    } finally {
      setSavingCustomerIds((prev) => {
        const next = new Set(prev);
        next.delete(customerId);
        return next;
      });
    }
  };

  const handleConfirmAll = async () => {
    setIsSaving(true);
    try {
      const payload: DeliveryInput[] = rows.map((r) => buildDeliveryPayload(r));

      await onBatchConfirm(payload);
      setModifiedCustomerIds(new Set());
      setHasUnsavedChanges(false);
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          status: r.status === 'skipped' ? 'skipped' : 'confirmed',
        }))
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Direct WhatsApp Share (Image PNG default / PDF)
  const handleShareCustomerReceipt = async (r: GridDeliveryRow) => {
    if (!r.customerMobile) {
      alert(`No mobile number registered for ${r.customerName}`);
      return;
    }
    setSharingCustomerId(r.customerId);
    const effectiveAgencyName = agencySettings?.agency_name || 'Satvik Milk Agency';
    try {
      const lineItems = Object.entries(r.items)
        .filter(([_, qty]) => qty > 0)
        .map(([pIdStr, qty]) => {
          const pId = Number(pIdStr);
          const prod = products.find((p) => p.id === pId);
          const sch = schedules.find(
            (s) => s.customer_id === r.customerId && s.product_id === pId
          );
          const rate = sch?.custom_price || prod?.default_selling_price || 0;
          return {
            name: prod?.name || `Product #${pId}`,
            quantity: qty,
            unit: prod?.unit || 'Ltr',
            unitPrice: rate,
            lineAmount: calculateLineAmountPaise(qty, rate),
          };
        });

      const todayPayments = (payments || []).filter(
        (p) => p.customer_id === r.customerId && p.payment_date === selectedDate && p.status !== 'failed'
      );
      const paymentRecd = todayPayments.reduce((sum, p) => sum + p.amount, 0);

      const custLedger = (ledgerEntries || []).filter((e) => e.customer_id === r.customerId);
      const custObj = customers.find((c) => c.id === r.customerId);
      const closingBal = custLedger.length
        ? custLedger[custLedger.length - 1].running_balance
        : (custObj?.opening_balance ?? 0) + r.totalAmountPaise - paymentRecd;
      const prevBal = closingBal - r.totalAmountPaise + paymentRecd;

      const dateStr = selectedDate.replace(/-/g, '');
      const receiptCode = `RCP-${dateStr}-${r.customerCode}`;
      const headerColor = agencySettings?.receipt_header_color || '#00A8E8';
      const message = formatInvoiceWhatsAppMessage({
        customerName: r.customerName,
        agencyName: effectiveAgencyName,
        agencyBrandLine: agencySettings?.receipt_brand_line,
        agencyPhone: agencySettings?.mobile,
        amountPaise: closingBal,
      });

      if (lineItems.length === 0) {
        openWhatsAppShare({
          mobile: r.customerMobile,
          message,
        });
        return;
      }

      if (receiptFormat === 'image') {
        const imageBlob = await generateReceiptImageBlob({
          agencyName: effectiveAgencyName,
          agencyAddress: agencySettings?.address,
          agencyMobile: agencySettings?.mobile,
          receiptBrandLine: agencySettings?.receipt_brand_line,
          receiptGst: agencySettings?.receipt_gst,
          logoBase64: agencySettings?.logo_path,
          receiptNo: receiptCode,
          date: formatDate(selectedDate),
          customerName: r.customerName,
          customerCode: r.customerCode,
          customerMobile: r.customerMobile,
          items: lineItems,
          todayTotal: r.totalAmountPaise,
          previousBalance: prevBal,
          paymentReceived: paymentRecd,
          closingBalance: closingBal,
          footerNote: agencySettings?.default_receipt_footer,
          headerColor,
        });

        await shareImageOnWhatsApp({
          mobile: r.customerMobile,
          message,
          imageBlob,
          fileName: `${receiptCode}.png`,
        });
      } else {
        const pdfBlob = await pdf(
          <DailyReceiptDocument
            agencyName={effectiveAgencyName}
            agencyAddress={agencySettings?.address}
            agencyMobile={agencySettings?.mobile}
            receiptBrandLine={agencySettings?.receipt_brand_line}
            receiptGst={agencySettings?.receipt_gst}
            logoUrl={agencySettings?.logo_path}
            receiptNo={receiptCode}
            date={formatDate(selectedDate)}
            customerName={r.customerName}
            customerCode={r.customerCode}
            customerMobile={r.customerMobile}
            session={session === 'morning' ? 'Morning' : 'Evening'}
            items={lineItems}
            todayTotal={r.totalAmountPaise}
            previousBalance={prevBal}
            paymentReceived={paymentRecd}
            closingBalance={closingBal}
            footerNote={agencySettings?.default_receipt_footer}
            headerColor={headerColor}
          />
        ).toBlob();

        await sharePdfOnWhatsApp({
          mobile: r.customerMobile,
          message,
          pdfBlob,
          fileName: `${receiptCode}.pdf`,
        });
      }
    } catch (err) {
      console.error('Failed to share delivery bill:', err);
      if (r.customerMobile) {
        openWhatsAppShare({
          mobile: r.customerMobile,
          message: formatInvoiceWhatsAppMessage({
            customerName: r.customerName,
            agencyName: effectiveAgencyName,
            agencyBrandLine: agencySettings?.receipt_brand_line,
            agencyPhone: agencySettings?.mobile,
            amountPaise: r.totalAmountPaise,
          }),
        });
      }
    } finally {
      setSharingCustomerId(null);
    }
  };

  // Quick Date Jump
  const handleShiftDate = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().slice(0, 10));
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (routeFilter !== 'all' && r.routeArea !== routeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.customerName.toLowerCase().includes(q) ||
          r.customerCode.toLowerCase().includes(q) ||
          r.routeArea.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, routeFilter, searchQuery]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const totalScheduledCustomers = rows.filter((r) => r.totalQuantity > 0).length;
    const confirmedCount = rows.filter((r) => r.status === 'confirmed').length;
    const totalVolume = rows
      .filter((r) => r.status !== 'skipped')
      .reduce((sum, r) => sum + r.totalQuantity, 0);
    const totalRevenuePaise = rows
      .filter((r) => r.status !== 'skipped')
      .reduce((sum, r) => sum + r.totalAmountPaise, 0);

    return {
      totalScheduledCustomers,
      confirmedCount,
      totalVolume,
      totalRevenuePaise,
    };
  }, [rows]);

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Scheduled</p>
            <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5 truncate">
              {metrics.totalScheduledCustomers}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {rows.length} Total
              </span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Milk className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Total Volume</p>
            <p className="text-base sm:text-lg font-semibold text-blue-600 mt-0.5 font-mono truncate">
              {metrics.totalVolume.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">Litres</span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Day Revenue</p>
            <p className="text-base sm:text-lg font-semibold text-emerald-600 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.totalRevenuePaise)}
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Dispatched</p>
            <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5 truncate">
              {metrics.confirmedCount}{' '}
              <span className="text-xs font-normal text-emerald-600">
                Confirmed
              </span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Date & Shift Navigator Toolbar */}
      <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Quick Date Stepper */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => handleShiftDate(-1)}
                title="Previous Day"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-1 text-xs font-semibold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              />
              <button
                onClick={() => handleShiftDate(1)}
                title="Next Day"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Shift Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shrink-0">
              <button
                onClick={() => setSession('morning')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  session === 'morning'
                    ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 font-normal'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Morning</span>
              </button>
              <button
                onClick={() => setSession('evening')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  session === 'evening'
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 font-normal'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Evening</span>
              </button>
            </div>

            {/* Daily Bill Receipt Sharing Format (Default: Image) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setReceiptFormat('image')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  receiptFormat === 'image'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 font-normal'
                }`}
              >
                <FileImage className="w-3.5 h-3.5 text-blue-600" />
                <span>Image (Default)</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptFormat('pdf')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  receiptFormat === 'pdf'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 font-normal'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Route Filter Dropdown & Confirm Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 border-t border-slate-100 text-xs gap-2.5">
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="px-2.5 py-2 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
          >
            <option value="all">All Routes ({customers.length} accounts)</option>
            {routes
              .filter((r) => r !== 'all')
              .map((r) => (
                <option key={r} value={r}>
                  Route: {r}
                </option>
              ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmAll}
            isLoading={isSaving}
            className="w-full sm:w-auto min-h-10.5 justify-center shadow-2xs font-medium"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSaving
                ? 'Saving Deliveries...'
                : modifiedCustomerIds.size === 1
                ? 'Save 1 Modified Delivery'
                : modifiedCustomerIds.size > 1
                ? `Save ${modifiedCustomerIds.size} Modified Deliveries`
                : metrics.confirmedCount === rows.length && rows.length > 0
                ? 'All Deliveries Confirmed ✓'
                : 'Confirm & Post Deliveries'}
            </span>
          </Button>
        </div>
      </div>

      {/* Workflow Guidance & Status Banner */}
      <div
        className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 shadow-2xs transition-colors ${
          metrics.confirmedCount === rows.length && rows.length > 0 && modifiedCustomerIds.size === 0
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : modifiedCustomerIds.size > 0
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-blue-50/70 border-blue-200 text-blue-900'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {metrics.confirmedCount === rows.length && rows.length > 0 && modifiedCustomerIds.size === 0 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : modifiedCustomerIds.size > 0 ? (
            <AlertCircle className="w-4 h-4 text-amber-600" />
          ) : (
            <Milk className="w-4 h-4 text-blue-600" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">
            {metrics.confirmedCount === rows.length && rows.length > 0 && modifiedCustomerIds.size === 0
              ? `All Deliveries Confirmed & Posted to Customer Ledgers`
              : modifiedCustomerIds.size > 0
              ? `${modifiedCustomerIds.size} Modified Delivery Change(s) Detected`
              : `Auto-Calculated Dispatch Sheet (Draft Mode)`}
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
            {metrics.confirmedCount === rows.length && rows.length > 0 && modifiedCustomerIds.size === 0
              ? `Deliveries for ${selectedDate} (${session === 'morning' ? 'Morning Shift' : 'Evening Shift'}) are saved and posted. Any change you make will safely adjust ONLY that customer's bill—no other customers will be duplicated.`
              : modifiedCustomerIds.size > 0
              ? `You edited ${modifiedCustomerIds.size} customer(s). Posting will ONLY update their accounts by the difference. All other customers remain untouched (Zero duplicates). You can also click "Save" directly on any customer card below.`
              : `Quantities above are auto-calculated from active subscription schedules for ${currentWeekday.toUpperCase()} (${session === 'morning' ? 'Morning Shift' : 'Evening Shift'}). Customer ledgers are NOT charged yet. Click "Confirm & Post Deliveries" to officially post.`}
          </p>
        </div>
      </div>

      {/* MOBILE DELIVERY TOUCH CARDS (Designed for delivery on phones) */}
      <div className="space-y-3 md:hidden">
        {filteredRows.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No active customers in this route.
          </div>
        ) : (
          filteredRows.map((r) => {
            const isConfirmed = r.status === 'confirmed';
            const isSkipped = r.status === 'skipped';

            return (
              <div
                key={r.customerId}
                className={`bg-white rounded-2xl border p-4 shadow-2xs transition-all space-y-3 ${
                  isSkipped
                    ? 'border-slate-200 opacity-60 bg-slate-50/50'
                    : isConfirmed
                    ? 'border-emerald-200/90'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 leading-tight truncate">
                        {r.customerName}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        {r.customerCode}
                      </span>
                      {modifiedCustomerIds.has(r.customerId) && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                          Modified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{r.routeArea}</span>
                    </div>
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleRowStatus(r.customerId)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                      isConfirmed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isSkipped
                        ? 'bg-slate-200 text-slate-600 border-slate-300'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isConfirmed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isSkipped ? (
                      <X className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                    <span className="capitalize">{r.status}</span>
                  </button>
                </div>

                {/* Touch-Friendly Steppers for Active Products */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {activeProducts.map((p) => {
                    const currentQty = r.items[p.id!] || 0;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium text-slate-800 block truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            Rate: {formatPaiseAsINR(p.default_selling_price)} / {p.unit}
                          </span>
                        </div>

                        {/* Big Touch Stepper Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                r.customerId,
                                p.id!,
                                Math.max(0, currentQty - (p.unit === 'Litre' || p.unit === 'Kilogram' ? 0.5 : 1))
                              )
                            }
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm active:bg-slate-100 shadow-2xs cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            value={currentQty === 0 ? '' : currentQty}
                            placeholder="0"
                            onChange={(e) =>
                              handleQuantityChange(
                                r.customerId,
                                p.id!,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-14 text-center font-mono font-bold text-sm text-slate-900 bg-white border border-slate-200 rounded-xl py-1.5 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                r.customerId,
                                p.id!,
                                currentQty + (p.unit === 'Litre' || p.unit === 'Kilogram' ? 0.5 : 1)
                              )
                            }
                            className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm active:bg-blue-700 shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Card Footer: Total Amount & Slip Actions */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-slate-400 block truncate">Total Due</span>
                    <span className="font-mono font-bold text-base text-blue-700 truncate block">
                      {formatPaiseAsINR(r.totalAmountPaise)}{' '}
                      <span className="text-[11px] text-slate-500 font-sans font-normal">
                        ({r.totalQuantity} {r.totalQuantity === 1 ? 'Unit' : 'Units'})
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {modifiedCustomerIds.has(r.customerId) && (
                      <button
                        onClick={() => handleSaveSingleCustomer(r.customerId)}
                        disabled={savingCustomerIds.has(r.customerId)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingCustomerIds.has(r.customerId) ? 'Saving...' : 'Save'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onGenerateReceipt(r)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Slip</span>
                    </button>

                    {r.customerMobile && (
                      <button
                        onClick={() => handleShareCustomerReceipt(r)}
                        disabled={sharingCustomerId === r.customerId}
                        title={`Share ${receiptFormat.toUpperCase()} Delivery Bill on WhatsApp`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer shrink-0 font-medium text-xs shadow-2xs"
                      >
                        {sharingCustomerId === r.customerId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        ) : (
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>{receiptFormat === 'image' ? 'IMG Slip' : 'PDF Slip'}</span>
                      </button>
                    )}
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
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Customer & Route</th>
                {activeProducts.map((p) => (
                  <th key={p.id} className="py-3.5 px-4 text-right">
                    {p.name} ({p.unit})
                  </th>
                ))}
                <th className="py-3.5 px-4 text-right">Total Qty</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Slip & Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6 + activeProducts.length} className="py-12 text-center text-slate-400">
                    No active customers in this route.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => {
                  const isConfirmed = r.status === 'confirmed';
                  const isSkipped = r.status === 'skipped';

                  return (
                    <tr
                      key={r.customerId}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isSkipped ? 'opacity-60 bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {r.customerCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-slate-900 leading-tight">
                          {r.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{r.routeArea}</div>
                      </td>

                      {/* Product Steppers / Numeric Inputs */}
                      {activeProducts.map((p) => {
                        const currentQty = r.items[p.id!] || 0;
                        return (
                          <td key={p.id} className="py-3.5 px-4 text-right">
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              value={currentQty === 0 ? '' : currentQty}
                              placeholder="0"
                              onChange={(e) =>
                                handleQuantityChange(
                                  r.customerId,
                                  p.id!,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-18 px-2 py-1 text-xs text-right font-mono font-bold text-slate-800 rounded-lg border border-slate-200 bg-blue-50/20 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </td>
                        );
                      })}

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-semibold text-slate-800">
                          {r.totalQuantity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-xs text-blue-700">
                          {formatPaiseAsINR(r.totalAmountPaise)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleToggleRowStatus(r.customerId)}
                            className="cursor-pointer"
                          >
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                                isConfirmed
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isSkipped
                                  ? 'bg-slate-200 text-slate-600 border-slate-300'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isConfirmed
                                    ? 'bg-emerald-500'
                                    : isSkipped
                                    ? 'bg-slate-400'
                                    : 'bg-amber-500'
                                }`}
                              />
                              {r.status}
                            </span>
                          </button>
                          {modifiedCustomerIds.has(r.customerId) && (
                            <span className="text-[10px] font-semibold text-amber-600">
                              (Unsaved)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {modifiedCustomerIds.has(r.customerId) && (
                            <button
                              onClick={() => handleSaveSingleCustomer(r.customerId)}
                              disabled={savingCustomerIds.has(r.customerId)}
                              title="Save changes for this customer only"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{savingCustomerIds.has(r.customerId) ? 'Saving...' : 'Save'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => onGenerateReceipt(r)}
                            title="Print 80mm Thermal Slip"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Slip</span>
                          </button>
                          {r.customerMobile && (
                            <button
                              onClick={() => handleShareCustomerReceipt(r)}
                              disabled={sharingCustomerId === r.customerId}
                              title={`Share ${receiptFormat.toUpperCase()} Delivery Bill on WhatsApp`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer font-medium text-xs"
                            >
                              {sharingCustomerId === r.customerId ? (
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                              ) : (
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>{receiptFormat === 'image' ? 'IMG' : 'PDF'}</span>
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
    </div>
  );
};
