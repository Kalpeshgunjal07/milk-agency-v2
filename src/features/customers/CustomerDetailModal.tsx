import React, { useState } from 'react';
import {
  AgencySettings,
  CustomerRecord,
  DeliveryRecord,
  DeliveryScheduleRecord,
  LedgerEntryRecord,
  PaymentRecord,
} from '../../types/models';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { formatPaiseAsINR } from '../../lib/calculations/money';
import { formatDate, formatDateTime } from '../../lib/formatters/date';
import { Button } from '../../components/ui/Button';
import {
  Phone,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Truck,
  BookOpen,
  Send,
  Milk,
  MessageCircle,
  FileImage,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  openWhatsAppShare,
  shareImageOnWhatsApp,
  sharePdfOnWhatsApp,
  formatInvoiceWhatsAppMessage,
  formatPaymentWhatsAppMessage,
} from '../../lib/whatsapp/share';
import { pdf } from '@react-pdf/renderer';
import { DailyReceiptDocument } from '../../lib/pdf/receiptPdf';
import { generateReceiptImageBlob, generatePaymentReceiptImageBlob } from '../../lib/receiptImage';
import { AGENCY_LOGO_BASE64 } from '../../lib/logoBase64';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord | null;
  schedules: DeliveryScheduleRecord[];
  deliveries: DeliveryRecord[];
  payments: PaymentRecord[];
  ledgerEntries: LedgerEntryRecord[];
  agencySettings?: AgencySettings | null;
  onAddDelivery: (customerId: number) => void;
  onAddPayment: (customerId: number) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  schedules,
  deliveries,
  payments,
  ledgerEntries,
  agencySettings,
  onAddDelivery,
  onAddPayment,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [receiptFormat, setReceiptFormat] = useState<'image' | 'pdf'>('image');
  const [sharingDeliveryId, setSharingDeliveryId] = useState<number | null>(null);
  const [sharingPaymentId, setSharingPaymentId] = useState<number | null>(null);

  if (!customer) return null;

  const custSchedules = schedules.filter((s) => s.customer_id === customer.id);
  const custDeliveries = deliveries.filter((d) => d.customer_id === customer.id);
  const custPayments = payments.filter((p) => p.customer_id === customer.id);
  const custLedger = ledgerEntries.filter((l) => l.customer_id === customer.id);

  const currentBalance = custLedger.length
    ? custLedger[custLedger.length - 1].running_balance
    : customer.opening_balance;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'schedules', label: 'Subscriptions', badge: custSchedules.length },
    { id: 'deliveries', label: 'Deliveries', badge: custDeliveries.length },
    { id: 'payments', label: 'Payments', badge: custPayments.length },
    { id: 'ledger', label: 'Ledger Audit', badge: custLedger.length },
  ];

  const handleShareDeliverySlip = async (d: DeliveryRecord) => {
    if (!customer?.mobile) return;
    setSharingDeliveryId(d.id || null);
    const effectiveAgencyName = agencySettings?.agency_name || 'Satvik Milk Agency';
    try {
      const lineItems = (d.items || []).map((it) => ({
        name: it.product_name_snapshot,
        quantity: it.quantity,
        unit: it.unit_snapshot,
        unitPrice: it.unit_price,
        lineAmount: it.line_amount,
      }));

      const dateStr = d.delivery_date.replace(/-/g, '');
      const receiptCode = `RCP-${dateStr}-${customer.customer_code}`;
      const headerColor = agencySettings?.receipt_header_color || '#00A8E8';
      const prevBal = currentBalance - d.total_amount;
      const message = formatInvoiceWhatsAppMessage({
        customerName: customer.name,
        agencyName: effectiveAgencyName,
        agencyBrandLine: agencySettings?.receipt_brand_line,
        agencyPhone: agencySettings?.mobile,
        amountPaise: currentBalance,
      });

      if (lineItems.length === 0) {
        openWhatsAppShare({
          mobile: customer.mobile,
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
          date: formatDate(d.delivery_date),
          customerName: customer.name,
          customerCode: customer.customer_code,
          customerMobile: customer.mobile,
          items: lineItems,
          todayTotal: d.total_amount,
          previousBalance: prevBal,
          paymentReceived: 0,
          closingBalance: currentBalance,
          footerNote: agencySettings?.default_receipt_footer,
          headerColor,
        });

        await shareImageOnWhatsApp({
          mobile: customer.mobile,
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
            date={formatDate(d.delivery_date)}
            customerName={customer.name}
            customerCode={customer.customer_code}
            customerMobile={customer.mobile}
            session={d.session_key === 'morning' ? 'Morning' : 'Evening'}
            items={lineItems}
            todayTotal={d.total_amount}
            previousBalance={prevBal}
            paymentReceived={0}
            closingBalance={currentBalance}
            footerNote={agencySettings?.default_receipt_footer}
            headerColor={headerColor}
          />
        ).toBlob();

        await sharePdfOnWhatsApp({
          mobile: customer.mobile,
          message,
          pdfBlob,
          fileName: `${receiptCode}.pdf`,
        });
      }
    } catch (err) {
      console.error('Failed to share delivery slip from customer modal:', err);
      openWhatsAppShare({
        mobile: customer.mobile,
        message: formatInvoiceWhatsAppMessage({
          customerName: customer.name,
          agencyName: effectiveAgencyName,
          agencyBrandLine: agencySettings?.receipt_brand_line,
          agencyPhone: agencySettings?.mobile,
          amountPaise: d.total_amount,
        }),
      });
    } finally {
      setSharingDeliveryId(null);
    }
  };

  const handleSharePaymentSlip = async (p: PaymentRecord) => {
    if (!customer?.mobile) return;
    setSharingPaymentId(p.id || null);
    const effectiveAgencyName = agencySettings?.agency_name || 'Satvik Milk Agency';
    try {
      const paymentEntry = custLedger.find(
        (l) => l.related_entity_type === 'payments' && l.related_entity_id === p.id
      );
      const closingBal = paymentEntry ? paymentEntry.running_balance : currentBalance;
      const prevBal = closingBal + p.amount;

      const dateStr = p.payment_date.replace(/-/g, '');
      const receiptCode = `RCP-PAY-${dateStr}-${customer.customer_code}`;
      const headerColor = agencySettings?.receipt_header_color || '#00A8E8';

      const message = formatPaymentWhatsAppMessage({
        customerName: customer.name,
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
        logoBase64: agencySettings?.logo_path || AGENCY_LOGO_BASE64,
        receiptNo: receiptCode,
        date: formatDate(p.payment_date),
        customerName: customer.name,
        customerCode: customer.customer_code,
        customerMobile: customer.mobile,
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
        mobile: customer.mobile,
        message,
        imageBlob,
        fileName: `${receiptCode}.png`,
      });
    } catch (err) {
      console.error('Failed to share payment slip:', err);
      if (customer.mobile) {
        openWhatsAppShare(customer.mobile);
      }
    } finally {
      setSharingPaymentId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${customer.name} (${customer.customer_code})`}
      subtitle={`Customer Account 360° Profile • ${customer.route_area || 'Standard Route'}`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Top Summary Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 font-medium truncate">Current Outstanding Balance</p>
            <p
              className={`text-xl sm:text-2xl font-bold font-mono mt-0.5 truncate ${
                currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatPaiseAsINR(currentBalance)}
              <span className="text-xs font-sans font-medium ml-2">
                {currentBalance > 0 ? '(Customer owes)' : currentBalance < 0 ? '(Advance balance)' : '(Settled)'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button size="sm" variant="outline" onClick={() => onAddDelivery(customer.id!)} className="flex-1 sm:flex-initial min-h-[40px] justify-center">
              <Truck className="w-3.5 h-3.5" /> Delivery
            </Button>
            <Button size="sm" variant="success" onClick={() => onAddPayment(customer.id!)} className="flex-1 sm:flex-initial min-h-[40px] justify-center">
              <CreditCard className="w-3.5 h-3.5" /> Payment
            </Button>
            {customer.mobile && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-initial min-h-[40px] justify-center"
                onClick={() =>
                  openWhatsAppShare({
                    mobile: customer.mobile,
                    message: formatInvoiceWhatsAppMessage({
                      customerName: customer.name,
                      agencyName: agencySettings?.agency_name,
                      agencyBrandLine: agencySettings?.receipt_brand_line,
                      agencyPhone: agencySettings?.mobile,
                      amountPaise: currentBalance,
                    }),
                  })
                }
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-100">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Contact & Location</p>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{customer.mobile || 'No mobile registered'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{customer.address || 'No street address provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>Route: {customer.route_area || 'Default Route'}</span>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-100">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Account History</p>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Customer Since: {formatDate(customer.joining_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Opening Balance: {formatPaiseAsINR(customer.opening_balance)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Status: <Badge variant={customer.status === 'active' ? 'success' : 'default'}>{customer.status}</Badge></span>
              </div>
              {customer.notes && (
                <p className="p-2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Note: {customer.notes}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-2">
            {custSchedules.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">No regular subscriptions configured.</p>
            ) : (
              custSchedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Product #{s.product_id} • {s.quantity} units daily
                    </p>
                    <p className="text-[11px] text-slate-500">Days: {s.delivery_days.toUpperCase()}</p>
                  </div>
                  <Badge variant={s.status === 'active' ? 'success' : 'warning'}>{s.status}</Badge>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 text-xs">
              <span className="text-slate-500 font-medium">Deliveries Log ({custDeliveries.length})</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setReceiptFormat('image')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    receiptFormat === 'image'
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileImage className="w-3 h-3 text-blue-600" />
                  <span>Image (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptFormat('pdf')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    receiptFormat === 'pdf'
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3 h-3 text-rose-600" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {custDeliveries.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">No delivery records found.</p>
              ) : (
                custDeliveries.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors text-xs space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900">{formatDate(d.delivery_date)}</span>
                        <span className="text-slate-400 ml-2 capitalize font-medium">({d.session_key})</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-slate-900">{formatPaiseAsINR(d.total_amount)}</span>
                        <Badge variant={d.status === 'confirmed' ? 'success' : 'default'} size="sm">
                          {d.status}
                        </Badge>
                        {customer.mobile && (
                          <button
                            type="button"
                            onClick={() => handleShareDeliverySlip(d)}
                            disabled={sharingDeliveryId === d.id}
                            title={`Share ${receiptFormat.toUpperCase()} Delivery Slip on WhatsApp`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer text-xs font-medium"
                          >
                            {sharingDeliveryId === d.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                            ) : (
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>{receiptFormat === 'image' ? 'IMG Slip' : 'PDF Slip'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Delivered Items List */}
                    <div className="pt-1.5 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5">
                      {d.items && d.items.length > 0 ? (
                        d.items.map((it, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
                          >
                            <Milk className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>
                              {it.product_name_snapshot}: <strong>{it.quantity} {it.unit_snapshot}</strong>
                            </span>
                            <span className="text-slate-400">({formatPaiseAsINR(it.line_amount)})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {d.total_quantity} Unit(s) delivered
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {custPayments.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">No payments collected yet.</p>
            ) : (
              custPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{formatDate(p.payment_date)}</span>
                    <span className="text-slate-500 ml-2">via {p.payment_method.toUpperCase()}</span>
                    {p.reference_no && (
                      <span className="ml-1 text-[10px] text-slate-400 font-mono">({p.reference_no})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-600">+{formatPaiseAsINR(p.amount)}</span>
                    {customer.mobile && (
                      <button
                        onClick={() => handleSharePaymentSlip(p)}
                        disabled={sharingPaymentId === p.id}
                        title="Send Payment Receipt on WhatsApp"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {sharingPaymentId === p.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                        ) : (
                          <Send className="w-3 h-3 text-emerald-600" />
                        )}
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
            {custLedger.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">No ledger transactions.</p>
            ) : (
              custLedger.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-2 px-1 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{l.description}</p>
                    <p className="text-[10px] text-slate-400">{formatDateTime(l.created_at)}</p>
                  </div>
                  <div className="text-right font-mono">
                    {l.debit_amount > 0 && <span className="text-rose-600 font-bold block">+{formatPaiseAsINR(l.debit_amount)}</span>}
                    {l.credit_amount > 0 && <span className="text-emerald-600 font-bold block">-{formatPaiseAsINR(l.credit_amount)}</span>}
                    <span className="text-[10px] text-slate-500">Bal: {formatPaiseAsINR(l.running_balance)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
