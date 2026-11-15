import React, { useState, useEffect, useMemo } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  AgencySettings,
  CustomerRecord,
  DeliveryInput,
  DeliveryItemInput,
  DeliveryScheduleRecord,
  LedgerEntryRecord,
  PaymentInput,
  PaymentMethod,
  ProductRecord,
} from '../../types/models';
import { DailyReceiptDocument } from '../../lib/pdf/receiptPdf';
import { AGENCY_LOGO_BASE64 } from '../../lib/logoBase64';
import { formatDate } from '../../lib/formatters/date';
import {
  sharePdfOnWhatsApp,
  shareImageOnWhatsApp,
  formatInvoiceWhatsAppMessage,
} from '../../lib/whatsapp/share';
import { generateReceiptImageBlob } from '../../lib/receiptImage';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  formatPaiseAsINR,
  parseRupeesToPaise,
  calculateLineAmountPaise,
} from '../../lib/calculations/money';
import {
  Truck,
  Plus,
  Trash2,
  Calendar,
  Sun,
  Moon,
  Milk,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Minus,
  Banknote,
  CreditCard,
  Receipt,
  Check,
} from 'lucide-react';

interface RecordDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (delivery: DeliveryInput, payment?: PaymentInput) => Promise<void>;
  customers: CustomerRecord[];
  products: ProductRecord[];
  schedules: DeliveryScheduleRecord[];
  defaultCustomerId?: number;
  agencySettings?: AgencySettings;
  ledgerEntries?: LedgerEntryRecord[];
}

interface DeliveryLineState {
  productId: number;
  quantity: number;
  unitPriceRupees: string;
}

export const RecordDeliveryModal: React.FC<RecordDeliveryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  products,
  schedules,
  defaultCustomerId,
  agencySettings,
  ledgerEntries,
}) => {
  const [customerId, setCustomerId] = useState<number>(defaultCustomerId || customers[0]?.id || 1);
  const [deliveryDate, setDeliveryDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [sessionKey, setSessionKey] = useState<'morning' | 'evening'>('morning');
  const [deliveryLines, setDeliveryLines] = useState<DeliveryLineState[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [receiptFormat, setReceiptFormat] = useState<'image' | 'pdf'>('image');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Instant Billing / Payment collected on delivery
  const [isPaidOnDelivery, setIsPaidOnDelivery] = useState<boolean>(false);
  const [paidAmountRupees, setPaidAmountRupees] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentRef, setPaymentRef] = useState<string>('');

  const activeCustomers = useMemo(() => {
    return customers.filter((c) => !c.deleted_at);
  }, [customers]);

  const selectedCustomer = useMemo(() => {
    return activeCustomers.find((c) => c.id === customerId) || activeCustomers[0];
  }, [activeCustomers, customerId]);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status === 'active' && !p.deleted_at);
  }, [products]);

  // When customerId changes or modal opens, initialize lines from active customer schedules
  useEffect(() => {
    if (!isOpen) return;

    const currentCustId = defaultCustomerId || customerId || customers[0]?.id || 1;
    setCustomerId(currentCustId);
    setDeliveryDate(new Date().toISOString().slice(0, 10));
    setSessionKey('morning');
    setNotes('');
    setIsPaidOnDelivery(false);
    setPaidAmountRupees('');
    setPaymentMethod('cash');
    setPaymentRef('');

    // Check if customer has active schedules
    const custSchedules = schedules.filter(
      (s) => s.customer_id === currentCustId && s.status === 'active'
    );

    if (custSchedules.length > 0) {
      const initialLines: DeliveryLineState[] = custSchedules.map((s) => {
        const prod = products.find((p) => p.id === s.product_id);
        const ratePaise = s.custom_price || prod?.default_selling_price || 0;
        return {
          productId: s.product_id,
          quantity: s.quantity,
          unitPriceRupees: (ratePaise / 100).toFixed(2),
        };
      });
      setDeliveryLines(initialLines);
    } else if (activeProducts.length > 0) {
      const defaultProd = activeProducts[0];
      setDeliveryLines([
        {
          productId: defaultProd.id!,
          quantity: 1.0,
          unitPriceRupees: (defaultProd.default_selling_price / 100).toFixed(2),
        },
      ]);
    } else {
      setDeliveryLines([]);
    }
  }, [isOpen, defaultCustomerId, customerId, schedules, products, activeProducts, customers]);

  // Update line quantity
  const handleUpdateQty = (index: number, newQty: number) => {
    setDeliveryLines((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, quantity: Math.max(0.25, newQty) } : line))
    );
  };

  // Update line product
  const handleUpdateProduct = (index: number, prodId: number) => {
    const prod = products.find((p) => p.id === prodId);
    const sch = schedules.find((s) => s.customer_id === customerId && s.product_id === prodId);
    const ratePaise = sch?.custom_price || prod?.default_selling_price || 0;

    setDeliveryLines((prev) =>
      prev.map((line, idx) =>
        idx === index
          ? {
              ...line,
              productId: prodId,
              unitPriceRupees: (ratePaise / 100).toFixed(2),
            }
          : line
      )
    );
  };

  // Update line rate
  const handleUpdateRate = (index: number, rateStr: string) => {
    setDeliveryLines((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, unitPriceRupees: rateStr } : line))
    );
  };

  // Add line item
  const handleAddLine = () => {
    if (activeProducts.length === 0) return;
    const nextProd =
      activeProducts.find((p) => !deliveryLines.some((l) => l.productId === p.id)) ||
      activeProducts[0];

    const sch = schedules.find((s) => s.customer_id === customerId && s.product_id === nextProd.id);
    const ratePaise = sch?.custom_price || nextProd.default_selling_price || 0;

    setDeliveryLines((prev) => [
      ...prev,
      {
        productId: nextProd.id!,
        quantity: 1.0,
        unitPriceRupees: (ratePaise / 100).toFixed(2),
      },
    ]);
  };

  // Remove line item
  const handleRemoveLine = (index: number) => {
    if (deliveryLines.length <= 1) return;
    setDeliveryLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculated totals
  const totals = useMemo(() => {
    let totalQty = 0;
    let totalAmountPaise = 0;

    deliveryLines.forEach((line) => {
      const ratePaise = parseRupeesToPaise(line.unitPriceRupees);
      totalQty += line.quantity;
      totalAmountPaise += calculateLineAmountPaise(line.quantity, ratePaise);
    });

    return {
      totalQty: parseFloat(totalQty.toFixed(2)),
      totalAmountPaise,
    };
  }, [deliveryLines]);

  // Customer's current ledger balance before this transaction
  const custEntries = useMemo(() => {
    return (ledgerEntries || []).filter((l) => l.customer_id === customerId);
  }, [ledgerEntries, customerId]);

  const prevBal = useMemo(() => {
    if (custEntries.length > 0) {
      return custEntries[custEntries.length - 1].running_balance;
    }
    return selectedCustomer?.opening_balance || 0;
  }, [custEntries, selectedCustomer]);

  // Instant payment amount in paise
  const paymentAmountPaise = useMemo(() => {
    if (!isPaidOnDelivery) return 0;
    return Math.max(0, parseRupeesToPaise(paidAmountRupees));
  }, [isPaidOnDelivery, paidAmountRupees]);

  // Projected new balance after delivery bill (+debit) and instant payment (-credit)
  const projectedClosingBalance = useMemo(() => {
    return prevBal + totals.totalAmountPaise - paymentAmountPaise;
  }, [prevBal, totals.totalAmountPaise, paymentAmountPaise]);

  // Toggle handler for Instant Billing
  const handleTogglePaidOnDelivery = (checked: boolean) => {
    setIsPaidOnDelivery(checked);
    if (checked && (!paidAmountRupees || paidAmountRupees === '' || paidAmountRupees === '0' || paidAmountRupees === '0.00')) {
      setPaidAmountRupees((totals.totalAmountPaise / 100).toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || deliveryLines.length === 0 || totals.totalAmountPaise <= 0) return;

    setIsSubmitting(true);
    try {
      const itemsPayload: DeliveryItemInput[] = deliveryLines.map((line) => {
        const prod = products.find((p) => p.id === line.productId);
        const ratePaise = parseRupeesToPaise(line.unitPriceRupees);
        return {
          customer_id: customerId,
          product_id: line.productId,
          product_name_snapshot: prod?.name || `Product #${line.productId}`,
          unit_snapshot: prod?.unit || 'Litre',
          quantity: line.quantity,
          unit_price: ratePaise,
          line_amount: calculateLineAmountPaise(line.quantity, ratePaise),
        };
      });

      const payload: DeliveryInput = {
        customer_id: customerId,
        product_id: itemsPayload[0]?.product_id || 0,
        delivery_date: deliveryDate,
        session_key: sessionKey,
        status: 'confirmed',
        total_quantity: totals.totalQty,
        total_amount: totals.totalAmountPaise,
        notes: notes.trim() || undefined,
        items: itemsPayload,
      };

      // Construct instant payment payload if customer paid on the spot
      let paymentPayload: PaymentInput | undefined = undefined;
      if (isPaidOnDelivery && paymentAmountPaise > 0) {
        paymentPayload = {
          customer_id: customerId,
          payment_date: deliveryDate,
          amount: paymentAmountPaise,
          payment_method: paymentMethod,
          reference_no: paymentRef.trim() || undefined,
          notes: `Instant payment at delivery (${sessionKey === 'morning' ? 'Morning' : 'Evening'})`,
          status: 'posted',
        };
      }

      await onSave(payload, paymentPayload);

      // WhatsApp sharing with digital color receipt (Image Default or PDF) and direct customer redirect
      if (sendWhatsApp && selectedCustomer?.mobile) {
        try {
          const closingBal = prevBal + totals.totalAmountPaise - paymentAmountPaise;
          const effectiveAgencyName = agencySettings?.agency_name || 'Satvik Milk Agency';
          const effectiveLogo = agencySettings?.logo_path || AGENCY_LOGO_BASE64;
          const receiptCode = `RCP-${deliveryDate.replace(/-/g, '')}-${customerId}`;
          const headerColor = agencySettings?.receipt_header_color || '#00A8E8';

          const message = formatInvoiceWhatsAppMessage({
            customerName: selectedCustomer.name,
            agencyName: effectiveAgencyName,
            agencyBrandLine: agencySettings?.receipt_brand_line,
            agencyPhone: agencySettings?.mobile,
            amountPaise: closingBal,
          });

          const slipItems = itemsPayload.map((it) => ({
            name: it.product_name_snapshot,
            quantity: it.quantity,
            unit: it.unit_snapshot,
            unitPrice: it.unit_price,
            lineAmount: it.line_amount,
          }));

          if (receiptFormat === 'image') {
            // 1. Generate High-DPI PNG Image Slip (Default)
            const imageBlob = await generateReceiptImageBlob({
              agencyName: effectiveAgencyName,
              agencyAddress: agencySettings?.address,
              agencyMobile: agencySettings?.mobile,
              receiptBrandLine: agencySettings?.receipt_brand_line,
              receiptGst: agencySettings?.receipt_gst,
              logoBase64: effectiveLogo,
              receiptNo: receiptCode,
              date: formatDate(deliveryDate),
              customerName: selectedCustomer.name,
              customerCode: selectedCustomer.customer_code,
              customerMobile: selectedCustomer.mobile,
              items: slipItems,
              todayTotal: totals.totalAmountPaise,
              previousBalance: prevBal,
              paymentReceived: paymentAmountPaise,
              closingBalance: closingBal,
              footerNote: agencySettings?.default_receipt_footer,
              headerColor,
            });

            await shareImageOnWhatsApp({
              mobile: selectedCustomer.mobile,
              message,
              imageBlob,
              fileName: `${receiptCode}.png`,
            });
          } else {
            // 2. Generate Digital Color Delivery Slip PDF
            const pdfBlob = await pdf(
              <DailyReceiptDocument
                agencyName={effectiveAgencyName}
                agencyAddress={agencySettings?.address}
                agencyMobile={agencySettings?.mobile}
                receiptBrandLine={agencySettings?.receipt_brand_line}
                receiptGst={agencySettings?.receipt_gst}
                logoUrl={effectiveLogo}
                receiptNo={receiptCode}
                date={formatDate(deliveryDate)}
                customerName={selectedCustomer.name}
                customerCode={selectedCustomer.customer_code}
                customerMobile={selectedCustomer.mobile}
                session={sessionKey === 'morning' ? 'Morning' : 'Evening'}
                items={slipItems}
                todayTotal={totals.totalAmountPaise}
                previousBalance={prevBal}
                paymentReceived={paymentAmountPaise}
                closingBalance={closingBal}
                footerNote={agencySettings?.default_receipt_footer}
                headerColor={headerColor}
              />
            ).toBlob();

            await sharePdfOnWhatsApp({
              mobile: selectedCustomer.mobile,
              message,
              pdfBlob,
              fileName: `${receiptCode}.pdf`,
            });
          }
        } catch (shareErr) {
          console.error('Error sharing receipt for WhatsApp:', shareErr);
        }
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Delivery"
      subtitle="Log direct milk & dairy product delivery and immediately debit customer ledger"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Selector */}
        <div className="space-y-1">
          <Select
            label="Customer Account"
            value={customerId}
            onChange={(e) => setCustomerId(parseInt(e.target.value, 10))}
            required
          >
            {activeCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.customer_code}) {c.route_area ? `— ${c.route_area}` : ''}
              </option>
            ))}
          </Select>

          {selectedCustomer && (
            <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600">
              <span>
                Route: <strong>{selectedCustomer.route_area || 'Direct'}</strong>
              </span>
              <span>
                Phone: <strong>{selectedCustomer.mobile || 'No Mobile'}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Date & Shift Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Delivery Date
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setDeliveryDate(new Date().toISOString().slice(0, 10))}
                className="px-2.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
              >
                Today
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Delivery Shift
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSessionKey('morning')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  sessionKey === 'morning'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Morning Shift</span>
              </button>

              <button
                type="button"
                onClick={() => setSessionKey('evening')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  sessionKey === 'evening'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Evening Shift</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Items Table / List */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Milk className="w-4 h-4 text-blue-600" />
              <span>Delivered Dairy Products</span>
            </label>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {deliveryLines.map((line, index) => {
              const currentProd = products.find((p) => p.id === line.productId);
              const linePaise = calculateLineAmountPaise(
                line.quantity,
                parseRupeesToPaise(line.unitPriceRupees)
              );

              return (
                <div
                  key={index}
                  className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Product Selector */}
                    <div className="flex-1">
                      <select
                        value={line.productId}
                        onChange={(e) => handleUpdateProduct(index, parseInt(e.target.value, 10))}
                        className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                      >
                        {activeProducts.length === 0 ? (
                          <option disabled value="">No products available. Add in Products section.</option>
                        ) : (
                          activeProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.unit}) — {formatPaiseAsINR(p.default_selling_price)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {deliveryLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quantity Stepper & Price Input */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 text-xs pt-1">
                    {/* Touch Stepper */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQty(
                            index,
                            line.quantity - (currentProd?.unit === 'Piece' || currentProd?.unit === 'Packet' ? 1 : 0.5)
                          )
                        }
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold active:bg-slate-100 cursor-pointer shadow-2xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <div className="relative">
                        <input
                          type="number"
                          step="0.25"
                          min="0.25"
                          value={line.quantity}
                          onChange={(e) => handleUpdateQty(index, parseFloat(e.target.value) || 0)}
                          className="w-14 sm:w-16 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded-xl py-1.5 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQty(
                            index,
                            line.quantity + (currentProd?.unit === 'Piece' || currentProd?.unit === 'Packet' ? 1 : 0.5)
                          )
                        }
                        className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold active:bg-blue-700 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[11px] text-slate-500 ml-1 whitespace-nowrap">
                        {currentProd?.unit || 'Litre'}
                      </span>
                    </div>

                    {/* Rate & Line Total */}
                    <div className="flex items-center gap-2 shrink-0 w-full min-[360px]:w-auto justify-between min-[360px]:justify-end">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400">@ ₹</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={line.unitPriceRupees}
                          onChange={(e) => handleUpdateRate(index, e.target.value)}
                          className="w-14 sm:w-16 px-1.5 py-1 text-xs text-right font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                        />
                      </div>

                      <span className="font-mono font-semibold text-xs text-blue-700 whitespace-nowrap min-w-16 text-right">
                        = {formatPaiseAsINR(linePaise)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Summary Card */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-normal">Total Quantity Delivered:</span>
            <span className="font-mono font-bold text-slate-900">{totals.totalQty} Units</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
            <span className="text-slate-800 font-semibold">Total Delivery Bill:</span>
            <span className="font-mono font-bold text-base text-blue-700">
              {formatPaiseAsINR(totals.totalAmountPaise)}
            </span>
          </div>
        </div>

        {/* Instant Payment / Billing on Delivery Option */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs transition-all">
          <div
            onClick={() => handleTogglePaidOnDelivery(!isPaidOnDelivery)}
            className={`flex items-center justify-between p-3 cursor-pointer select-none transition-colors ${
              isPaidOnDelivery
                ? 'bg-emerald-50/90 border-b border-emerald-200/90'
                : 'bg-slate-50/70 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  isPaidOnDelivery
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                  <span>Customer Paid at Delivery?</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Instant Billing
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Record immediate payment received and instantly reduce customer dues
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isPaidOnDelivery}
                onChange={(e) => handleTogglePaidOnDelivery(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {isPaidOnDelivery && (
            <div className="p-3.5 space-y-3 bg-white">
              {/* Amount input & Quick Chips */}
              <div>
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between mb-1.5 gap-2">
                  <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                    Payment Received (₹)
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPaidAmountRupees((totals.totalAmountPaise / 100).toFixed(2))}
                      className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Exact Bill: {formatPaiseAsINR(totals.totalAmountPaise)}
                    </button>
                    {prevBal > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPaidAmountRupees(
                            ((prevBal + totals.totalAmountPaise) / 100).toFixed(2)
                          )
                        }
                        className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Full Settle: {formatPaiseAsINR(prevBal + totals.totalAmountPaise)}
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={paidAmountRupees}
                    onChange={(e) => setPaidAmountRupees(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                    required={isPaidOnDelivery}
                  />
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-2 min-[420px]:grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'cash', label: 'Cash' },
                      { id: 'upi', label: 'UPI / GPay' },
                      { id: 'bank_transfer', label: 'Bank' },
                      { id: 'other', label: 'Cheque/Other' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-medium transition-colors text-center cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Number / Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Reference / UPI Ref / Cheque No. (Optional)"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1.5 focus:ring-emerald-500"
                />
              </div>

              {/* Real-time Ledger Balance Preview */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Previous Dues:</span>
                  <span className="font-mono">{formatPaiseAsINR(prevBal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>+ Today's Delivery Bill:</span>
                  <span className="font-mono font-semibold text-blue-700">
                    +{formatPaiseAsINR(totals.totalAmountPaise)}
                  </span>
                </div>
                {paymentAmountPaise > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-medium">
                    <span>- Payment Collected Now:</span>
                    <span className="font-mono font-bold">
                      -{formatPaiseAsINR(paymentAmountPaise)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-semibold text-slate-900">
                  <span>Projected Closing Balance:</span>
                  <span
                    className={`font-mono text-xs ${
                      projectedClosingBalance <= 0 ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {projectedClosingBalance <= 0 && paymentAmountPaise > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fully Settled (₹0.00)</span>
                      </span>
                    ) : (
                      formatPaiseAsINR(projectedClosingBalance)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Optional Notes */}
        <Input
          label="Delivery Notes (Optional)"
          placeholder="e.g. Left on porch, customer asked for evening packet"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* WhatsApp Share & Format Option */}
        {selectedCustomer?.mobile && (
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-900">
                Send delivery bill directly to {selectedCustomer.name} ({selectedCustomer.mobile}) on WhatsApp
              </span>
            </label>

            {sendWhatsApp && (
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-[11px] gap-2 flex-wrap">
                <span className="text-emerald-800 font-medium">Daily Bill Format:</span>
                <div className="flex bg-white p-0.5 rounded-lg border border-emerald-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setReceiptFormat('image')}
                    className={`px-2.5 min-[360px]:px-3 py-1 rounded-md text-[11px] min-[360px]:text-xs font-semibold transition-all cursor-pointer ${
                      receiptFormat === 'image'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Image Slip<span className="hidden min-[360px]:inline"> (Default)</span></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptFormat('pdf')}
                    className={`px-2.5 min-[360px]:px-3 py-1 rounded-md text-[11px] min-[360px]:text-xs font-semibold transition-all cursor-pointer ${
                      receiptFormat === 'pdf'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>PDF Slip</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 sm:flex-initial justify-center min-h-11"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={totals.totalAmountPaise <= 0}
            className="flex-2 sm:flex-initial justify-center min-h-11"
          >
            {isPaidOnDelivery && paymentAmountPaise > 0 ? (
              <>
                <CreditCard className="w-4 h-4 shrink-0" />
                <span className="truncate">Confirm & Collect {formatPaiseAsINR(paymentAmountPaise)}</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 shrink-0" />
                <span>Confirm Delivery</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
