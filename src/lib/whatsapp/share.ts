/**
 * WhatsApp Sharing Utilities for Invoices, Receipts, and Daily Delivery Slips.
 * Formats phone numbers to 91XXXXXXXXXX and opens direct WhatsApp chat.
 * Uses Web Share API on mobile to attach files with caption directly inside 1 message.
 */

export interface InvoiceShareMessageData {
  customerName: string;
  agencyName?: string;
  agencyBrandLine?: string;
  agencyPhone?: string;
  amountPaise: number;
}

/**
 * Formats the exact professional Sale Invoice message requested:
 * Hi [Customer Name],
 * Details of your Sale Invoice from [Agency Name].
 * Invoice Amount: [Amount]
 * Thank you for doing business with us,
 * [Agency Name]
 * [Agency Phone]
 */
export function formatInvoiceWhatsAppMessage(data: InvoiceShareMessageData): string {
  let agency = (data.agencyName || 'Satvik Milk Agency').trim();
  if (data.agencyBrandLine && !agency.toLowerCase().includes(data.agencyBrandLine.toLowerCase())) {
    agency = `${agency} ${data.agencyBrandLine}`.trim();
  }
  const phone = data.agencyPhone || '8600732906';
  const formattedAmount = (Math.abs(data.amountPaise) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const agencyPeriod = agency.endsWith('.') ? '' : '.';

  return [
    `Hi ${data.customerName},`,
    `Details of your Sale Invoice from ${agency}${agencyPeriod}`,
    `Invoice Amount: ${formattedAmount}`,
    `Thank you for doing business with us,`,
    `${agency}`,
    `${phone}`,
  ].join('\n');
}

export interface DailyReceiptShareData {
  agencyName?: string;
  agencyPhone?: string;
  customerName: string;
  customerPhone?: string;
  receiptNo?: string;
  date?: string;
  items?: { name: string; quantity: number; unit: string; rate: number; amount: number }[];
  todayTotalPaise?: number;
  previousBalancePaise?: number;
  paymentReceivedPaise?: number;
  closingBalancePaise: number;
  footerNote?: string;
}

export function generateDailyReceiptWhatsAppText(data: DailyReceiptShareData): string {
  return formatInvoiceWhatsAppMessage({
    customerName: data.customerName,
    agencyName: data.agencyName,
    agencyPhone: data.agencyPhone,
    amountPaise: data.closingBalancePaise,
  });
}

export interface MonthlyBillShareData {
  agencyName?: string;
  agencyPhone?: string;
  customerName: string;
  customerCode?: string;
  customerPhone?: string;
  billNumber?: string;
  periodStart?: string;
  periodEnd?: string;
  dailyEntries?: any[];
  productSummary?: any[];
  openingBalancePaise?: number;
  totalChargesPaise?: number;
  totalPaymentsPaise?: number;
  closingBalancePaise: number;
  footerNote?: string;
}

export function generateMonthlyBillWhatsAppText(data: MonthlyBillShareData): string {
  return formatInvoiceWhatsAppMessage({
    customerName: data.customerName,
    agencyName: data.agencyName,
    agencyPhone: data.agencyPhone,
    amountPaise: data.closingBalancePaise,
  });
}

export interface PaymentReceiptShareData {
  customerName: string;
  agencyName?: string;
  agencyBrandLine?: string;
  agencyPhone?: string;
  paymentAmountPaise: number;
  paymentMethod: string;
  paymentDate: string;
  receiptNo: string;
  referenceNo?: string;
  previousBalancePaise: number;
  closingBalancePaise: number;
  notes?: string;
}

/**
 * Formats a clear, professional payment voucher & receipt acknowledgement:
 * Hi [Customer Name],
 * Payment Receipt from [Agency Name].
 * We have received payment of ₹[Amount] via [Method].
 *
 * 🧾 Payment Details:
 * • Receipt No: [Receipt No]
 * • Date: [Date]
 * • Amount Received: ₹[Amount]
 * • Ref / Txn ID: [Ref]
 *
 * 📊 Account Balance Statement:
 * • Previous Balance: ₹[PrevBal]
 * • Amount Deducted: -₹[Amount]
 * • Remaining Balance Due / Settled: ₹[Remaining]
 *
 * Thank you for your payment!
 * [Agency Name]
 * [Agency Phone]
 */
export function formatPaymentWhatsAppMessage(data: PaymentReceiptShareData): string {
  let agency = (data.agencyName || 'Satvik Milk Agency').trim();
  if (data.agencyBrandLine && !agency.toLowerCase().includes(data.agencyBrandLine.toLowerCase())) {
    agency = `${agency} ${data.agencyBrandLine}`.trim();
  }
  const phone = data.agencyPhone || '8600732906';

  const formatINR = (paise: number) =>
    (Math.abs(paise) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const methodLabel =
    data.paymentMethod === 'cash'
      ? 'Cash'
      : data.paymentMethod === 'upi'
      ? 'UPI / QR Code'
      : data.paymentMethod === 'bank_transfer'
      ? 'Bank Transfer'
      : (data.paymentMethod || 'Cash').toUpperCase();

  let balanceText = '';
  if (data.closingBalancePaise > 0) {
    balanceText = `Remaining Balance Due: ₹${formatINR(data.closingBalancePaise)}`;
  } else if (data.closingBalancePaise < 0) {
    balanceText = `Advance Balance Available: ₹${formatINR(data.closingBalancePaise)}`;
  } else {
    balanceText = `Remaining Balance: ₹0.00 (All Dues Cleared)`;
  }

  const lines: (string | null)[] = [
    `Hi ${data.customerName},`,
    `Payment Receipt from ${agency}.`,
    `We have received payment of ₹${formatINR(data.paymentAmountPaise)} via ${methodLabel}.`,
    ``,
    `🧾 *Payment Details:*`,
    `• Receipt No: ${data.receiptNo}`,
    `• Date: ${data.paymentDate}`,
    `• Amount Received: ₹${formatINR(data.paymentAmountPaise)}`,
    data.referenceNo ? `• Ref / UTR No: ${data.referenceNo}` : null,
    data.notes ? `• Note: ${data.notes}` : null,
    ``,
    `📊 *Account Balance Statement:*`,
    `• Previous Balance: ₹${formatINR(data.previousBalancePaise)}`,
    `• Amount Deducted: -₹${formatINR(data.paymentAmountPaise)}`,
    `• *${balanceText}*`,
    ``,
    `Thank you for your payment! 🙏`,
    `${agency}`,
    `${phone}`,
  ];

  return lines.filter((l) => l !== null).join('\n');
}

export function openWhatsAppShare(
  mobileOrOpts: string | { mobile?: string; message: string } | undefined,
  maybeMessage?: string
) {
  let mobile: string | undefined;
  let message = '';

  if (typeof mobileOrOpts === 'object' && mobileOrOpts !== null) {
    mobile = mobileOrOpts.mobile;
    message = mobileOrOpts.message;
  } else {
    mobile = mobileOrOpts;
    message = maybeMessage || '';
  }

  const sanitizedMobile = (mobile || '').replace(/\D/g, '');
  // Format Indian mobile number directly to international 91 standard for instant chat redirect
  const phone = sanitizedMobile.length === 10 ? `91${sanitizedMobile}` : sanitizedMobile;
  const encodedText = encodeURIComponent(message);

  // Use direct api.whatsapp.com protocol to jump straight into customer chat on phone & desktop
  const url = phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(url, '_blank');
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export interface ShareImageOptions {
  mobile?: string;
  message: string;
  imageBlob: Blob;
  fileName: string;
}

export async function shareImageOnWhatsApp(options: ShareImageOptions): Promise<{ sharedDirectly: boolean }> {
  const { mobile, message, imageBlob, fileName } = options;

  // 1. Try native Web Share API with File (Mobile Chrome / Android / Safari / Supported Desktop)
  // Omitting 'title' ensures WhatsApp uses 'text' as the image's CAPTION inside the same message bubble
  if (typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator) {
    try {
      const file = new File([imageBlob], fileName, { type: 'image/png' });
      const sharePayload = {
        files: [file],
        text: message,
      };
      if (navigator.canShare(sharePayload) || navigator.canShare({ files: [file] })) {
        await navigator.share(sharePayload);
        return { sharedDirectly: true };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { sharedDirectly: true };
      }
      console.warn('Native image share failed, falling back to download + web chat:', err);
    }
  }

  // 2. Fallback: Copy caption to clipboard so user can paste inside image caption box
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // ignore clipboard error
    }
  }

  // Also try copying image to clipboard for desktop paste directly into WhatsApp Web
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': imageBlob }),
      ]);
    } catch {
      // ignore
    }
  }

  // Download image slip and open customer WhatsApp directly
  downloadBlob(imageBlob, fileName);
  openWhatsAppShare(mobile, message);

  return { sharedDirectly: false };
}

export interface SharePdfOptions {
  mobile?: string;
  message: string;
  pdfBlob: Blob;
  fileName: string;
}

export async function sharePdfOnWhatsApp(options: SharePdfOptions): Promise<{ sharedDirectly: boolean }> {
  const { mobile, message, pdfBlob, fileName } = options;

  // 1. Try native Web Share API with File (Mobile Chrome / Android / Safari / Supported Desktop)
  // Omitting 'title' ensures WhatsApp sets 'text' as the document caption inside the same message
  if (typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator) {
    try {
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      const sharePayload = {
        files: [file],
        text: message,
      };
      if (navigator.canShare(sharePayload) || navigator.canShare({ files: [file] })) {
        await navigator.share(sharePayload);
        return { sharedDirectly: true };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { sharedDirectly: true };
      }
      console.warn('Native share failed, falling back to download + web chat:', err);
    }
  }

  // 2. Fallback: Copy caption to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // ignore
    }
  }

  // Download PDF and open WhatsApp with prefilled message
  downloadBlob(pdfBlob, fileName);
  openWhatsAppShare(mobile, message);

  return { sharedDirectly: false };
}
