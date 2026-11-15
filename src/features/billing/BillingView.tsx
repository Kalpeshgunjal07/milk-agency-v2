import React, { useState, useMemo, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  AgencySettings,
  CustomerRecord,
  DeliveryRecord,
  LedgerEntryRecord,
  PaymentRecord,
  ProductRecord,
} from '../../types/models';
import { DailyReceiptDocument } from '../../lib/pdf/receiptPdf';
import { MonthlyBillDocument } from '../../lib/pdf/monthlyBillPdf';
import { AGENCY_LOGO_BASE64 } from '../../lib/logoBase64';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { formatPaiseAsINR, formatPaiseForPDF } from '../../lib/calculations/money';
import {
  formatDate,
  getPreviousMonthRange,
  getCurrentMonthRange,
  getLast30DaysRange,
} from '../../lib/formatters/date';
import {
  generateDailyReceiptWhatsAppText,
  generateMonthlyBillWhatsAppText,
  openWhatsAppShare,
  sharePdfOnWhatsApp,
  shareImageOnWhatsApp,
  downloadBlob,
} from '../../lib/whatsapp/share';
import { generateReceiptImageBlob } from '../../lib/receiptImage';
import {
  Printer,
  Download,
  Send,
  Calendar,
  Receipt,
  FileText,
  Phone,
  Building2,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Package,
} from 'lucide-react';

interface BillingViewProps {
  agencySettings: AgencySettings;
  customers: CustomerRecord[];
  products: ProductRecord[];
  deliveries: DeliveryRecord[];
  payments: PaymentRecord[];
  ledgerEntries: LedgerEntryRecord[];
  searchQuery?: string;
}

export const BillingView: React.FC<BillingViewProps> = ({
  agencySettings,
  customers,
  products,
  deliveries,
  payments,
  ledgerEntries,
  searchQuery,
}) => {
  const [docType, setDocType] = useState<'daily' | 'monthly'>('daily');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.id || 1);

  // Filter customers by search query (name, code, mobile, route)
  const filteredCustomers = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.customer_code.toLowerCase().includes(q) ||
        (c.mobile && c.mobile.includes(q)) ||
        (c.route_area && c.route_area.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // When search query is entered, auto-select the first matching customer
  useEffect(() => {
    if (searchQuery && searchQuery.trim() && filteredCustomers.length > 0) {
      if (!filteredCustomers.some((c) => c.id === selectedCustomerId)) {
        setSelectedCustomerId(filteredCustomers[0].id!);
      }
    }
  }, [searchQuery, filteredCustomers, selectedCustomerId]);

  // Daily Receipt Parameters
  const [receiptDate, setReceiptDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Monthly / Custom Bill Parameters
  const prevRange = getPreviousMonthRange();
  const [periodStart, setPeriodStart] = useState<string>(prevRange.start);
  const [periodEnd, setPeriodEnd] = useState<string>(prevRange.end);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccessNotice, setShareSuccessNotice] = useState<string | null>(null);
  const [dailyBillFormat, setDailyBillFormat] = useState<'image' | 'pdf'>('image');

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  const effectiveLogo = agencySettings.logo_path || AGENCY_LOGO_BASE64;

  // DAILY RECEIPT DATA CALCULATION
  const dailyReceiptData = useMemo(() => {
    if (!selectedCustomer) return null;

    const custDeliveries = deliveries.filter(
      (d) => d.customer_id === selectedCustomer.id && d.delivery_date === receiptDate
    );

    const deliveryItems: {
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      lineAmount: number;
    }[] = [];

    let todayTotal = 0;

    custDeliveries.forEach((d) => {
      todayTotal += d.total_amount;
      if (d.items && d.items.length > 0) {
        d.items.forEach((it) => {
          deliveryItems.push({
            name: it.product_name_snapshot,
            quantity: it.quantity,
            unit: it.unit_snapshot,
            unitPrice: it.unit_price,
            lineAmount: it.line_amount,
          });
        });
      } else {
        const prod = products.find((p) => p.id === d.product_id);
        deliveryItems.push({
          name: prod?.name || 'Milk Delivery',
          quantity: d.total_quantity,
          unit: prod?.unit || 'Ltr',
          unitPrice: prod?.default_selling_price || 0,
          lineAmount: d.total_amount,
        });
      }
    });

    // Payments received on receiptDate
    const todayPayments = payments.filter(
      (p) => p.customer_id === selectedCustomer.id && p.payment_date === receiptDate
    );
    const paymentRecd = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    // Running balance calculation
    const custLedger = ledgerEntries.filter((l) => l.customer_id === selectedCustomer.id);
    const closingBalance = custLedger.length
      ? custLedger[custLedger.length - 1].running_balance
      : selectedCustomer.opening_balance;
    const previousBalance = closingBalance - todayTotal + paymentRecd;

    return {
      receiptNo: `RCP-${receiptDate.replace(/-/g, '')}-${selectedCustomer.id}`,
      items: deliveryItems,
      todayTotal,
      previousBalance,
      paymentReceived: paymentRecd,
      closingBalance,
    };
  }, [selectedCustomer, deliveries, payments, ledgerEntries, receiptDate, products]);

  // MONTHLY / CUSTOM BILL DATA CALCULATION (Date-by-Date Log & Summary)
  const monthlyBillData = useMemo(() => {
    if (!selectedCustomer) return null;

    // Filter deliveries within period [periodStart, periodEnd]
    const periodDeliveries = deliveries
      .filter(
        (d) =>
          d.customer_id === selectedCustomer.id &&
          d.delivery_date >= periodStart &&
          d.delivery_date <= periodEnd &&
          d.status === 'confirmed'
      )
      .sort((a, b) => a.delivery_date.localeCompare(b.delivery_date));

    // Payments received during period (active/posted/confirmed, not cancelled)
    const periodPayments = payments
      .filter(
        (p) =>
          p.customer_id === selectedCustomer.id &&
          p.payment_date >= periodStart &&
          p.payment_date <= periodEnd &&
          p.status !== 'cancelled'
      )
      .sort((a, b) => a.payment_date.localeCompare(b.payment_date));

    const totalPayments = periodPayments.reduce((sum, p) => sum + p.amount, 0);

    const paymentsList = periodPayments.map((p) => ({
      id: p.id,
      date: formatDate(p.payment_date),
      rawDate: p.payment_date,
      paymentMethod:
        p.payment_method === 'upi'
          ? 'UPI / Online'
          : p.payment_method === 'cash'
          ? 'Cash'
          : p.payment_method === 'bank_transfer'
          ? 'Bank Transfer'
          : 'Cheque / Other',
      referenceNo: p.reference_no,
      amount: p.amount,
    }));

    // Opening balance strictly prior to periodStart
    const custLedgerPrior = ledgerEntries.filter(
      (l) => l.customer_id === selectedCustomer.id && l.created_at && l.created_at < `${periodStart}T00:00:00Z`
    );
    const openingBalance = custLedgerPrior.length
      ? custLedgerPrior[custLedgerPrior.length - 1].running_balance
      : selectedCustomer.opening_balance;

    // Product-wise aggregation
    const productMap = new Map<number, { name: string; totalQty: number; unit: string; rate: number; totalAmt: number }>();

    let totalCharges = 0;
    periodDeliveries.forEach((d) => {
      totalCharges += d.total_amount;
      if (d.items && d.items.length > 0) {
        d.items.forEach((it) => {
          const existing = productMap.get(it.product_id) || {
            name: it.product_name_snapshot,
            totalQty: 0,
            unit: it.unit_snapshot,
            rate: it.unit_price,
            totalAmt: 0,
          };
          existing.totalQty += it.quantity;
          existing.totalAmt += it.line_amount;
          productMap.set(it.product_id, existing);
        });
      } else {
        const prod = products.find((p) => p.id === d.product_id);
        const pId = d.product_id || 1;
        const existing = productMap.get(pId) || {
          name: prod?.name || 'Milk Delivery',
          totalQty: 0,
          unit: prod?.unit || 'Ltr',
          rate: prod?.default_selling_price || 0,
          totalAmt: 0,
        };
        existing.totalQty += d.total_quantity;
        existing.totalAmt += d.total_amount;
        productMap.set(pId, existing);
      }
    });

    const productSummary = Array.from(productMap.values()).map((p) => ({
      productName: p.name,
      totalQuantity: parseFloat(p.totalQty.toFixed(2)),
      unit: p.unit,
      rate: p.rate,
      totalAmount: p.totalAmt,
    }));

    const closingBalance = openingBalance + totalCharges - totalPayments;

    // Running cumulative settlement coverage to eliminate confusing per-row "Unpaid" tags
    let cumCharges = Math.max(0, openingBalance);
    let rollingBalance = openingBalance;

    const dailyEntries = periodDeliveries.map((d) => {
      // Find payments on this specific delivery date
      const paymentsOnDate = periodPayments.filter((p) => p.payment_date === d.delivery_date);
      const paidOnDate = paymentsOnDate.reduce((sum, p) => sum + p.amount, 0);

      cumCharges += d.total_amount;
      rollingBalance += d.total_amount - paidOnDate;

      // Clear, logical settlement status:
      let paymentStatus: 'Settled' | 'Paid at Delivery' | 'Covered' | 'In Bill Due' = 'In Bill Due';
      if (closingBalance <= 0) {
        // Entire monthly account has been paid in full / settled
        paymentStatus = 'Settled';
      } else if (paidOnDate >= d.total_amount && d.total_amount > 0) {
        // Paid on the spot at delivery time
        paymentStatus = 'Paid at Delivery';
      } else if (totalPayments >= cumCharges) {
        // Covered by period payments
        paymentStatus = 'Covered';
      } else {
        // Included in the final bill payable
        paymentStatus = 'In Bill Due';
      }

      // Description of items on that day
      let itemsDesc = '';
      if (d.items && d.items.length > 0) {
        itemsDesc = d.items
          .map((it) => `${it.product_name_snapshot} (${it.quantity}${it.unit_snapshot})`)
          .join(', ');
      } else {
        const prod = products.find((p) => p.id === d.product_id);
        itemsDesc = `${prod?.name || 'Milk Delivery'} (${d.total_quantity}${prod?.unit || 'Ltr'})`;
      }

      const formattedSession = d.session_key
        ? d.session_key.charAt(0).toUpperCase() + d.session_key.slice(1)
        : 'Morning';

      return {
        id: d.id,
        date: formatDate(d.delivery_date),
        rawDate: d.delivery_date,
        session: formattedSession,
        itemsDescription: itemsDesc,
        deliveryAmount: d.total_amount,
        paidAmount: paidOnDate,
        paymentStatus,
        runningBalance: rollingBalance,
      };
    });

    const isFullMonth =
      periodStart.slice(8, 10) === '01' &&
      new Date(new Date(periodStart).getFullYear(), new Date(periodStart).getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10) === periodEnd;

    const billTitle = isFullMonth ? 'MONTHLY STATEMENT' : 'CUSTOM BILL STATEMENT';

    return {
      billNumber: `BILL-${periodStart.slice(0, 7).replace('-', '')}-${selectedCustomer.id}`,
      billTitle,
      dailyEntries,
      paymentsList,
      productSummary,
      openingBalance,
      totalCharges,
      totalPayments,
      closingBalance,
    };
  }, [selectedCustomer, deliveries, payments, ledgerEntries, periodStart, periodEnd, products]);

  const handleShareDailySlip = async () => {
    if (!selectedCustomer || !dailyReceiptData) return;
    setIsSharing(true);
    try {
      const shareText = generateDailyReceiptWhatsAppText({
        agencyName: agencySettings.agency_name,
        agencyPhone: agencySettings.mobile,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.mobile,
        receiptNo: dailyReceiptData.receiptNo.replace('RCP-', ''),
        date: formatDate(receiptDate),
        items: dailyReceiptData.items.map((it) => ({
          name: it.name,
          quantity: it.quantity,
          unit: it.unit,
          rate: it.unitPrice,
          amount: it.lineAmount,
        })),
        todayTotalPaise: dailyReceiptData.todayTotal,
        previousBalancePaise: dailyReceiptData.previousBalance,
        paymentReceivedPaise: dailyReceiptData.paymentReceived,
        closingBalancePaise: dailyReceiptData.closingBalance,
        footerNote: agencySettings.default_receipt_footer,
      });

      if (dailyBillFormat === 'image') {
        // 1. Generate High-DPI PNG Image Slip (Default)
        const imageBlob = await generateReceiptImageBlob({
          agencyName: agencySettings.agency_name,
          agencyAddress: agencySettings.address,
          agencyMobile: agencySettings.mobile,
          receiptBrandLine: agencySettings.receipt_brand_line,
          receiptGst: agencySettings.receipt_gst,
          logoBase64: effectiveLogo,
          receiptNo: dailyReceiptData.receiptNo,
          date: formatDate(receiptDate),
          customerName: selectedCustomer.name,
          customerCode: selectedCustomer.customer_code,
          customerMobile: selectedCustomer.mobile,
          items: dailyReceiptData.items,
          todayTotal: dailyReceiptData.todayTotal,
          previousBalance: dailyReceiptData.previousBalance,
          paymentReceived: dailyReceiptData.paymentReceived,
          closingBalance: dailyReceiptData.closingBalance,
          footerNote: agencySettings.default_receipt_footer,
          headerColor: agencySettings.receipt_header_color || '#00A8E8',
        });

        const res = await shareImageOnWhatsApp({
          mobile: selectedCustomer.mobile,
          message: shareText,
          imageBlob,
          fileName: `${dailyReceiptData.receiptNo}.png`,
        });

        if (res.sharedDirectly) {
          setShareSuccessNotice('Delivery slip image & message shared in single WhatsApp bubble!');
        } else {
          setShareSuccessNotice(
            'Receipt image downloaded & caption copied! Paste (Ctrl+V) into WhatsApp to send in 1 message.'
          );
        }
      } else {
        // 2. Generate PDF Slip
        const pdfBlob = await pdf(
          <DailyReceiptDocument
            agencyName={agencySettings.agency_name}
            agencyAddress={agencySettings.address}
            agencyMobile={agencySettings.mobile}
            receiptBrandLine={agencySettings.receipt_brand_line}
            receiptGst={agencySettings.receipt_gst}
            logoUrl={effectiveLogo}
            receiptNo={dailyReceiptData.receiptNo}
            date={formatDate(receiptDate)}
            customerName={selectedCustomer.name}
            customerCode={selectedCustomer.customer_code}
            customerMobile={selectedCustomer.mobile}
            session="Morning"
            items={dailyReceiptData.items}
            todayTotal={dailyReceiptData.todayTotal}
            previousBalance={dailyReceiptData.previousBalance}
            paymentReceived={dailyReceiptData.paymentReceived}
            closingBalance={dailyReceiptData.closingBalance}
            footerNote={agencySettings.default_receipt_footer}
            headerColor={agencySettings.receipt_header_color || '#00A8E8'}
          />
        ).toBlob();

        const res = await sharePdfOnWhatsApp({
          mobile: selectedCustomer.mobile,
          message: shareText,
          pdfBlob,
          fileName: `${dailyReceiptData.receiptNo}.pdf`,
        });

        if (res.sharedDirectly) {
          setShareSuccessNotice('Delivery slip PDF & message shared in single WhatsApp bubble!');
        } else {
          setShareSuccessNotice(
            'Receipt PDF downloaded & caption copied! Attach PDF & paste caption in WhatsApp for 1 message.'
          );
        }
      }

      setTimeout(() => setShareSuccessNotice(null), 6000);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareMonthlyBill = async () => {
    if (!selectedCustomer || !monthlyBillData) return;
    setIsSharing(true);
    try {
      const pdfBlob = await pdf(
        <MonthlyBillDocument
          agencyName={agencySettings.agency_name}
          agencyAddress={agencySettings.address}
          agencyMobile={agencySettings.mobile}
          agencyGst={agencySettings.receipt_gst}
          logoUrl={effectiveLogo}
          billNumber={monthlyBillData.billNumber}
          billTitle={monthlyBillData.billTitle}
          periodStart={formatDate(periodStart)}
          periodEnd={formatDate(periodEnd)}
          customerName={selectedCustomer.name}
          customerCode={selectedCustomer.customer_code}
          customerAddress={selectedCustomer.address}
          customerMobile={selectedCustomer.mobile}
          dailyEntries={monthlyBillData.dailyEntries}
          paymentsList={monthlyBillData.paymentsList}
          productSummary={monthlyBillData.productSummary}
          openingBalance={monthlyBillData.openingBalance}
          totalCharges={monthlyBillData.totalCharges}
          totalPayments={monthlyBillData.totalPayments}
          closingBalance={monthlyBillData.closingBalance}
          footerNote={agencySettings.default_receipt_footer}
          headerColor={agencySettings.receipt_header_color || '#00A8E8'}
        />
      ).toBlob();

      const shareText = generateMonthlyBillWhatsAppText({
        agencyName: agencySettings.agency_name,
        agencyPhone: agencySettings.mobile,
        customerName: selectedCustomer.name,
        customerCode: selectedCustomer.customer_code,
        customerPhone: selectedCustomer.mobile,
        billNumber: monthlyBillData.billNumber,
        periodStart: formatDate(periodStart),
        periodEnd: formatDate(periodEnd),
        dailyEntries: monthlyBillData.dailyEntries,
        productSummary: monthlyBillData.productSummary,
        openingBalancePaise: monthlyBillData.openingBalance,
        totalChargesPaise: monthlyBillData.totalCharges,
        totalPaymentsPaise: monthlyBillData.totalPayments,
        closingBalancePaise: monthlyBillData.closingBalance,
        footerNote: agencySettings.default_receipt_footer,
      });

      const res = await sharePdfOnWhatsApp({
        mobile: selectedCustomer.mobile,
        message: shareText,
        pdfBlob,
        fileName: `${monthlyBillData.billNumber}.pdf`,
      });

      if (res.sharedDirectly) {
        setShareSuccessNotice('Monthly statement PDF & bill message shared to WhatsApp!');
      } else {
        setShareSuccessNotice(
          'Monthly bill PDF downloaded! Opening WhatsApp with date-wise log & thank you message.'
        );
      }
      setTimeout(() => setShareSuccessNotice(null), 6000);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      if (docType === 'daily' && dailyReceiptData) {
        if (dailyBillFormat === 'image') {
          // Download as High-DPI PNG Image Slip
          const imageBlob = await generateReceiptImageBlob({
            agencyName: agencySettings.agency_name,
            agencyAddress: agencySettings.address,
            agencyMobile: agencySettings.mobile,
            receiptBrandLine: agencySettings.receipt_brand_line,
            receiptGst: agencySettings.receipt_gst,
            logoBase64: effectiveLogo,
            receiptNo: dailyReceiptData.receiptNo,
            date: formatDate(receiptDate),
            customerName: selectedCustomer.name,
            customerCode: selectedCustomer.customer_code,
            customerMobile: selectedCustomer.mobile,
            items: dailyReceiptData.items,
            todayTotal: dailyReceiptData.todayTotal,
            previousBalance: dailyReceiptData.previousBalance,
            paymentReceived: dailyReceiptData.paymentReceived,
            closingBalance: dailyReceiptData.closingBalance,
            footerNote: agencySettings.default_receipt_footer,
            headerColor: agencySettings.receipt_header_color || '#00A8E8',
          });
          downloadBlob(imageBlob, `${dailyReceiptData.receiptNo}.png`);
        } else {
          // Download as PDF Slip
          const blob = await pdf(
            <DailyReceiptDocument
              agencyName={agencySettings.agency_name}
              agencyAddress={agencySettings.address}
              agencyMobile={agencySettings.mobile}
              receiptBrandLine={agencySettings.receipt_brand_line}
              receiptGst={agencySettings.receipt_gst}
              logoUrl={effectiveLogo}
              receiptNo={dailyReceiptData.receiptNo}
              date={formatDate(receiptDate)}
              customerName={selectedCustomer.name}
              customerCode={selectedCustomer.customer_code}
              customerMobile={selectedCustomer.mobile}
              session="Morning"
              items={dailyReceiptData.items}
              todayTotal={dailyReceiptData.todayTotal}
              previousBalance={dailyReceiptData.previousBalance}
              paymentReceived={dailyReceiptData.paymentReceived}
              closingBalance={dailyReceiptData.closingBalance}
              footerNote={agencySettings.default_receipt_footer}
              headerColor={agencySettings.receipt_header_color || '#00A8E8'}
            />
          ).toBlob();
          downloadBlob(blob, `${dailyReceiptData.receiptNo}.pdf`);
        }
      } else if (docType === 'monthly' && monthlyBillData) {
        const blob = await pdf(
          <MonthlyBillDocument
            agencyName={agencySettings.agency_name}
            agencyAddress={agencySettings.address}
            agencyMobile={agencySettings.mobile}
            agencyGst={agencySettings.receipt_gst}
            logoUrl={effectiveLogo}
            billNumber={monthlyBillData.billNumber}
            billTitle={monthlyBillData.billTitle}
            periodStart={formatDate(periodStart)}
            periodEnd={formatDate(periodEnd)}
            customerName={selectedCustomer.name}
            customerCode={selectedCustomer.customer_code}
            customerAddress={selectedCustomer.address}
            customerMobile={selectedCustomer.mobile}
            dailyEntries={monthlyBillData.dailyEntries}
            paymentsList={monthlyBillData.paymentsList}
            productSummary={monthlyBillData.productSummary}
            openingBalance={monthlyBillData.openingBalance}
            totalCharges={monthlyBillData.totalCharges}
            totalPayments={monthlyBillData.totalPayments}
            closingBalance={monthlyBillData.closingBalance}
            footerNote={agencySettings.default_receipt_footer}
            headerColor={agencySettings.receipt_header_color || '#00A8E8'}
          />
        ).toBlob();
        downloadBlob(blob, `${monthlyBillData.billNumber}.pdf`);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const totalDailyQty = dailyReceiptData?.items.reduce((sum, it) => sum + it.quantity, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Configuration Controls Bar (Hidden during print) */}
      <div className="print:hidden p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Document Type Switcher & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setDocType('daily')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer truncate ${
                docType === 'daily' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span className="truncate">Daily Slip</span>
            </button>
            <button
              onClick={() => setDocType('monthly')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer truncate ${
                docType === 'monthly' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span className="truncate">Monthly Bill</span>
            </button>
          </div>

          {/* Format Switcher (Image vs PDF) & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {docType === 'daily' && (
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setDailyBillFormat('image')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    dailyBillFormat === 'image'
                      ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 font-normal'
                  }`}
                >
                  <span>Image<span className="hidden min-[380px]:inline"> (Default)</span></span>
                </button>
                <button
                  type="button"
                  onClick={() => setDailyBillFormat('pdf')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    dailyBillFormat === 'pdf'
                      ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 font-normal'
                  }`}
                >
                  PDF
                </button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={!selectedCustomer}
              onClick={handlePrintSlip}
              className="flex-1 sm:flex-initial justify-center disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!selectedCustomer}
              onClick={handleDownloadPdf}
              isLoading={isGeneratingPdf}
              className="flex-1 sm:flex-initial justify-center disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>{docType === 'daily' && dailyBillFormat === 'image' ? 'Image' : 'PDF'}</span>
            </Button>
            <Button
              variant="success"
              size="sm"
              disabled={!selectedCustomer}
              isLoading={isSharing}
              onClick={docType === 'daily' ? handleShareDailySlip : handleShareMonthlyBill}
              className="w-full sm:w-auto justify-center min-h-10 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {docType === 'daily'
                  ? dailyBillFormat === 'image'
                    ? 'Share Image on WhatsApp'
                    : 'Share PDF on WhatsApp'
                  : 'Share PDF on WhatsApp'}
              </span>
            </Button>
          </div>
        </div>

        {shareSuccessNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{shareSuccessNotice}</span>
          </div>
        )}

        {/* Filters & Parameter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <Select
            label={searchQuery ? `Customer (${filteredCustomers.length} match)` : 'Customer'}
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
          >
            {filteredCustomers.length === 0 ? (
              <option disabled value="">No customer matching "{searchQuery}"</option>
            ) : (
              filteredCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customer_code}) {c.route_area ? `— ${c.route_area}` : ''}
                </option>
              ))
            )}
          </Select>

          {docType === 'daily' ? (
            <Input
              label="Delivery Date"
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
            />
          ) : (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Billing Period / Date Range
                  </label>
                  <div className="flex flex-wrap gap-2 text-[11px] text-sky-600 font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        const r = getCurrentMonthRange();
                        setPeriodStart(r.start);
                        setPeriodEnd(r.end);
                      }}
                      className="hover:underline cursor-pointer font-semibold"
                    >
                      This Month
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const r = getPreviousMonthRange();
                        setPeriodStart(r.start);
                        setPeriodEnd(r.end);
                      }}
                      className="hover:underline cursor-pointer"
                    >
                      Last Month
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const r = getLast30DaysRange();
                        setPeriodStart(r.start);
                        setPeriodEnd(r.end);
                      }}
                      className="hover:underline cursor-pointer"
                    >
                      Last 30 Days
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="From Date"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                  <Input
                    label="To Date"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="flex justify-center items-start py-4 px-2 min-[360px]:px-4 bg-slate-100/80 rounded-2xl border border-slate-200/80 min-h-[640px] overflow-x-hidden">
        {docType === 'daily' && dailyReceiptData ? (
          /* DIGITAL COLOR DELIVERY SLIP (Matches uploaded user mobile screenshot) */
          <div
            id="printable-slip"
            className="w-full max-w-full sm:max-w-[380px] bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden font-poppins text-slate-800 mx-auto"
          >
            {/* Top Customizable Color Banner */}
            <div
              style={{ backgroundColor: agencySettings.receipt_header_color || '#00A8E8' }}
              className="text-white text-center py-4 px-4 min-[360px]:px-6 transition-colors shadow-2xs"
            >
              <p className="text-xs font-normal opacity-95">Amount due</p>
              <h2 className="text-2xl font-bold tracking-tight mt-0.5">
                {formatPaiseForPDF(dailyReceiptData.closingBalance)}
              </h2>
            </div>

            <div className="p-3 min-[360px]:p-4 space-y-4">
              {/* Agency Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <h3 className="text-xs font-bold uppercase text-slate-800 leading-snug">
                    {agencySettings.agency_name}
                    {agencySettings.receipt_brand_line && ` ${agencySettings.receipt_brand_line}`}
                  </h3>
                  {agencySettings.address && (
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {agencySettings.address}
                    </p>
                  )}
                  {agencySettings.mobile && (
                    <p className="text-[11px] font-semibold text-[#00A8E8] flex items-center gap-1">
                      <Phone className="w-3 h-3 inline" /> {agencySettings.mobile}
                    </p>
                  )}
                  {agencySettings.receipt_gst && (
                    <p className="text-[10px] text-slate-500">
                      Company GST : <span className="font-mono">{agencySettings.receipt_gst}</span>
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">Maharashtra</p>
                </div>

                {/* Circular Agency Logo */}
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-50 border border-slate-200 shrink-0 shadow-xs">
                  <img
                    src={effectiveLogo}
                    alt={agencySettings.agency_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Bill To & Reference Row */}
              <div className="flex items-start justify-between py-2 border-y border-slate-200/80 text-[11px]">
                <div>
                  <span className="text-[#00A8E8] font-semibold text-[10px] block">Bill To:</span>
                  <p className="font-semibold text-slate-800">{selectedCustomer?.name}</p>
                  {selectedCustomer?.mobile && (
                    <p className="text-[#00A8E8] font-medium flex items-center gap-1 text-[10px]">
                      <Phone className="w-2.5 h-2.5 inline" /> {selectedCustomer.mobile}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px]">
                    <span className="text-[#00A8E8] font-semibold">Ref No: </span>
                    <span className="font-semibold text-slate-800">
                      {dailyReceiptData.receiptNo.replace('RCP-', '')}
                    </span>
                  </p>
                  <p className="text-[#00A8E8] font-semibold text-[10px] mt-1">Date of Issue</p>
                  <p className="font-bold text-slate-800">{formatDate(receiptDate)}</p>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-700 font-semibold text-[10px] uppercase">
                      <th className="py-1.5 px-2 w-8 text-center">SR</th>
                      <th className="py-1.5 px-2">Name</th>
                      <th className="py-1.5 px-2 text-center">Qty</th>
                      <th className="py-1.5 px-2 text-right">Price</th>
                      <th className="py-1.5 px-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyReceiptData.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-3 text-center text-slate-400 text-[10px]">
                          No delivery recorded for this customer on {formatDate(receiptDate)}
                        </td>
                      </tr>
                    ) : (
                      dailyReceiptData.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-2 text-center text-slate-500 text-[10px]">{idx + 1}</td>
                          <td className="py-1.5 px-2 font-medium text-slate-800">{it.name}</td>
                          <td className="py-1.5 px-2 text-center font-medium text-slate-700">
                            {it.quantity}{it.unit}
                          </td>
                          <td className="py-1.5 px-2 text-right text-slate-600">
                            {(it.unitPrice / 100).toFixed(2)}
                          </td>
                          <td className="py-1.5 px-2 text-right font-semibold text-slate-800">
                            {(it.lineAmount / 100).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {dailyReceiptData.items.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 font-bold bg-slate-50/80 text-slate-800">
                        <td className="py-1.5 px-2"></td>
                        <td className="py-1.5 px-2">Total</td>
                        <td className="py-1.5 px-2 text-center">{totalDailyQty}</td>
                        <td className="py-1.5 px-2"></td>
                        <td className="py-1.5 px-2 text-right">
                          {(dailyReceiptData.todayTotal / 100).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Financial Balance Summary Box */}
              <div className="flex justify-end pt-1">
                <div className="w-56 space-y-1 text-xs">
                  <div className="flex justify-between py-0.5 text-slate-600 font-medium">
                    <span>Total</span>
                    <span className="font-bold text-slate-800">
                      {(dailyReceiptData.todayTotal / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 text-slate-600">
                    <span>Balance</span>
                    <span>{(dailyReceiptData.todayTotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-slate-600">
                    <span>Previous Bal.</span>
                    <span>{(dailyReceiptData.previousBalance / 100).toFixed(2)}</span>
                  </div>
                  {dailyReceiptData.paymentReceived > 0 && (
                    <div className="flex justify-between py-0.5 text-emerald-600 font-medium">
                      <span>Paid Today</span>
                      <span>-{(dailyReceiptData.paymentReceived / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-t border-slate-300 font-bold text-slate-900 text-[13px]">
                    <span>Current Bal.</span>
                    <span>{(dailyReceiptData.closingBalance / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <p className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
                {agencySettings.default_receipt_footer || 'Thank you for doing business with us.'}
              </p>
            </div>
          </div>
        ) : docType === 'monthly' && monthlyBillData ? (
          /* MONTHLY / CUSTOM STATEMENT CARD (Date-by-Date Register & Complete Settlement) */
          <div
            id="printable-statement"
            className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden font-poppins text-slate-800 p-6 space-y-6"
          >
            {/* Header with Agency & Logo */}
            <div className="flex items-start justify-between border-b-2 border-[#00A8E8] pb-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold uppercase text-slate-900">{agencySettings.agency_name}</h2>
                {agencySettings.address && (
                  <p className="text-xs text-slate-500">{agencySettings.address}</p>
                )}
                {agencySettings.mobile && (
                  <p className="text-xs font-semibold text-[#00A8E8]">Tel: {agencySettings.mobile}</p>
                )}
                {agencySettings.receipt_gst && (
                  <p className="text-xs text-slate-500">GSTIN: {agencySettings.receipt_gst}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-50 border border-slate-200 shrink-0 shadow-xs">
                  <img
                    src={effectiveLogo}
                    alt={agencySettings.agency_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-[#00A8E8]">{monthlyBillData.billTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1">Bill No: {monthlyBillData.billNumber}</p>
                  <p className="text-xs text-slate-500">
                    Period: {formatDate(periodStart)} to {formatDate(periodEnd)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Details Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-start justify-between text-xs">
              <div>
                <p className="text-[10px] font-semibold text-[#00A8E8] uppercase">Billed To:</p>
                <p className="font-bold text-sm text-slate-800 mt-0.5">{selectedCustomer?.name}</p>
                <p className="text-slate-500">Customer Code: {selectedCustomer?.customer_code}</p>
                {selectedCustomer?.address && (
                  <p className="text-slate-500">Address: {selectedCustomer.address}</p>
                )}
              </div>
              <div className="text-right space-y-1.5">
                {selectedCustomer?.mobile && (
                  <p className="font-semibold text-[#00A8E8]">Tel: {selectedCustomer.mobile}</p>
                )}
                <div>
                  {monthlyBillData.closingBalance <= 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PAID & SETTLED</span>
                    </span>
                  ) : monthlyBillData.totalPayments > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                      <span>PARTIALLY PAID</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                      <span>PAYMENT DUE</span>
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px]">
                  Date of Issue: {new Date().toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* 5 Financial Metric Highlight Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">Previous Due</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5 block truncate">
                  {formatPaiseAsINR(monthlyBillData.openingBalance)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">Deliveries Total</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                  +{formatPaiseAsINR(monthlyBillData.totalCharges)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">Payments</span>
                <span className="text-xs font-bold text-emerald-600 mt-0.5 block truncate">
                  -{formatPaiseAsINR(monthlyBillData.totalPayments)}
                </span>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 min-w-0">
                <span className="text-[10px] text-sky-700 font-semibold block truncate">Total Due</span>
                <span className="text-xs font-bold text-sky-800 mt-0.5 block truncate">
                  {monthlyBillData.closingBalance <= 0 ? '₹0.00 (Settled)' : formatPaiseAsINR(monthlyBillData.closingBalance)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 min-w-0 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 block truncate">Delivery Days</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5 block truncate">
                  {monthlyBillData.dailyEntries.length} Deliveries
                </span>
              </div>
            </div>

            {/* SECTION 1: Date-Wise Delivery Register */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  1. Date-Wise Delivery Register
                </h4>
                <span className="text-[11px] text-slate-400">
                  {monthlyBillData.dailyEntries.length} delivery records in period
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Shift</th>
                      <th className="py-2.5 px-3">Delivered Products</th>
                      <th className="py-2.5 px-3 text-right">Delivery Amt</th>
                      <th className="py-2.5 px-3 text-right">Paid on Spot</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyBillData.dailyEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                          No confirmed deliveries found for {selectedCustomer?.name} between{' '}
                          {formatDate(periodStart)} and {formatDate(periodEnd)}.
                        </td>
                      </tr>
                    ) : (
                      monthlyBillData.dailyEntries.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-medium text-slate-800 whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="py-2 px-3 text-slate-500">{row.session}</td>
                          <td className="py-2 px-3 text-slate-700">{row.itemsDescription}</td>
                          <td className="py-2 px-3 text-right font-medium text-slate-800">
                            {formatPaiseAsINR(row.deliveryAmount)}
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-600 font-medium">
                            {row.paidAmount > 0 ? formatPaiseAsINR(row.paidAmount) : '—'}
                          </td>
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            {row.paymentStatus === 'Settled' ? (
                              <Badge variant="success" size="sm">
                                Settled
                              </Badge>
                            ) : row.paymentStatus === 'Covered' ? (
                              <Badge variant="success" size="sm">
                                Covered
                              </Badge>
                            ) : row.paymentStatus === 'Paid at Delivery' ? (
                              <Badge variant="success" size="sm">
                                Paid on Spot
                              </Badge>
                            ) : (
                              <Badge variant="outline" size="sm">
                                In Bill Due
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: Payments Received in this Period Register */}
            {monthlyBillData.paymentsList && monthlyBillData.paymentsList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    2. Payments Received in Period
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    {monthlyBillData.paymentsList.length} Transactions totaling{' '}
                    {formatPaiseAsINR(monthlyBillData.totalPayments)}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase border-b border-slate-200">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Payment Mode</th>
                        <th className="py-2.5 px-3">Reference / Txn ID</th>
                        <th className="py-2.5 px-3 text-right">Amount Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthlyBillData.paymentsList.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-medium text-slate-800 whitespace-nowrap">
                            {p.date}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{p.paymentMethod}</td>
                          <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                            {p.referenceNo || 'Direct Payment'}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-emerald-600">
                            {formatPaiseAsINR(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 3: Product-Wise Consumption & Financial Settlement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Product Summary Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {monthlyBillData.paymentsList && monthlyBillData.paymentsList.length > 0
                    ? '3. Product-Wise Summary'
                    : '2. Product-Wise Summary'}
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase border-b border-slate-200">
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3 text-right">Total Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthlyBillData.productSummary.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                            No products recorded.
                          </td>
                        </tr>
                      ) : (
                        monthlyBillData.productSummary.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-medium text-slate-800">{item.productName}</td>
                            <td className="py-2 px-3 text-right text-slate-600">
                              {item.totalQuantity} {item.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-600">
                              {formatPaiseAsINR(item.rate)}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-800">
                              {formatPaiseAsINR(item.totalAmount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Settlement Card */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {monthlyBillData.paymentsList && monthlyBillData.paymentsList.length > 0
                    ? '4. Statement Settlement'
                    : '3. Statement Settlement'}
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Previous Balance (Opening Due):</span>
                    <span>{formatPaiseAsINR(monthlyBillData.openingBalance)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Current Period Deliveries:</span>
                    <span className="font-medium text-slate-800">
                      +{formatPaiseAsINR(monthlyBillData.totalCharges)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Total Payments Received:</span>
                    <span className="font-semibold">-{formatPaiseAsINR(monthlyBillData.totalPayments)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t-2 border-[#00A8E8] pt-2.5 text-sm">
                    <span>Net Closing Balance Payable:</span>
                    <span className={monthlyBillData.closingBalance <= 0 ? 'text-emerald-600' : 'text-slate-900'}>
                      {monthlyBillData.closingBalance <= 0
                        ? '₹0.00 (Settled)'
                        : formatPaiseAsINR(monthlyBillData.closingBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-[11px] text-slate-400 pt-3 border-t border-slate-100">
              {agencySettings.default_receipt_footer || 'Thank you for your prompt payments!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 my-auto">
            <Receipt className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No Customer Selected</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Add your customers in the Customers section or select an active customer to generate bills, delivery slips, and monthly statements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
