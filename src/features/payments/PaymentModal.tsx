import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pdf } from '@react-pdf/renderer';
import {
  AgencySettings,
  CustomerRecord,
  LedgerEntryRecord,
  PaymentInput,
  PaymentRecord,
} from '../../types/models';
import { PaymentMethod } from '../../types/enums';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { parseRupeesToPaise, formatPaiseAsINR } from '../../lib/calculations/money';
import { formatDate } from '../../lib/formatters/date';
import { AGENCY_LOGO_BASE64 } from '../../lib/logoBase64';
import { PaymentReceiptDocument } from '../../lib/pdf/receiptPdf';
import { generatePaymentReceiptImageBlob } from '../../lib/receiptImage';
import {
  formatPaymentWhatsAppMessage,
  shareImageOnWhatsApp,
  sharePdfOnWhatsApp,
  openWhatsAppShare,
} from '../../lib/whatsapp/share';
import {
  MessageCircle,
  Receipt,
  Sparkles,
  FileImage,
  FileText,
} from 'lucide-react';

const paymentSchema = z.object({
  customer_id: z.string().min(1, 'Select a customer'),
  payment_date: z.string().min(10, 'Valid date required'),
  amount_rupees: z.string().min(1, 'Enter payment amount'),
  payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'other']),
  reference_no: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentInput) => Promise<void>;
  customers: CustomerRecord[];
  defaultCustomerId?: number;
  paymentToEdit?: PaymentRecord | null;
  agencySettings?: AgencySettings | null;
  ledgerEntries?: LedgerEntryRecord[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  defaultCustomerId,
  paymentToEdit,
  agencySettings,
  ledgerEntries,
}) => {
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [receiptFormat, setReceiptFormat] = useState<'image' | 'pdf'>('image');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customer_id: defaultCustomerId ? defaultCustomerId.toString() : '',
      payment_date: new Date().toISOString().slice(0, 10),
      amount_rupees: '',
      payment_method: 'cash',
      reference_no: '',
      notes: '',
    },
  });

  const selectedCustIdStr = watch('customer_id');
  const enteredAmountRupees = watch('amount_rupees');
  const selectedCustomerId = selectedCustIdStr ? parseInt(selectedCustIdStr, 10) : undefined;

  const activeCustomers = useMemo(() => {
    return customers.filter((c) => !c.deleted_at || c.id === paymentToEdit?.customer_id);
  }, [customers, paymentToEdit]);

  const selectedCustomer = useMemo(() => {
    return activeCustomers.find((c) => c.id === selectedCustomerId);
  }, [activeCustomers, selectedCustomerId]);

  // Customer ledger transactions
  const custEntries = useMemo(() => {
    if (!selectedCustomerId) return [];
    return (ledgerEntries || []).filter((l) => l.customer_id === selectedCustomerId);
  }, [ledgerEntries, selectedCustomerId]);

  // Previous Balance before this payment
  const previousBalancePaise = useMemo(() => {
    if (!selectedCustomer) return 0;
    if (paymentToEdit) {
      // Find the specific ledger transaction linked to this payment
      const paymentEntry = custEntries.find(
        (l) => l.related_entity_type === 'payments' && l.related_entity_id === paymentToEdit.id
      );
      if (paymentEntry) {
        return paymentEntry.running_balance + paymentToEdit.amount;
      }
    }
    if (custEntries.length > 0) {
      return custEntries[custEntries.length - 1].running_balance;
    }
    return selectedCustomer.opening_balance || 0;
  }, [custEntries, selectedCustomer, paymentToEdit]);

  // Current payment amount in paise
  const paymentAmountPaise = useMemo(() => {
    return Math.max(0, parseRupeesToPaise(enteredAmountRupees || '0'));
  }, [enteredAmountRupees]);

  // Projected new balance after deducting payment
  const projectedClosingBalance = useMemo(() => {
    return previousBalancePaise - paymentAmountPaise;
  }, [previousBalancePaise, paymentAmountPaise]);

  useEffect(() => {
    if (paymentToEdit) {
      reset({
        customer_id: paymentToEdit.customer_id.toString(),
        payment_date: paymentToEdit.payment_date,
        amount_rupees: (paymentToEdit.amount / 100).toFixed(2),
        payment_method: paymentToEdit.payment_method,
        reference_no: paymentToEdit.reference_no || '',
        notes: paymentToEdit.notes || '',
      });
      setSendWhatsApp(false);
    } else {
      const initialCustId = defaultCustomerId
        ? defaultCustomerId.toString()
        : activeCustomers[0]?.id?.toString() ?? '';
      reset({
        customer_id: initialCustId,
        payment_date: new Date().toISOString().slice(0, 10),
        amount_rupees: '',
        payment_method: 'cash',
        reference_no: '',
        notes: '',
      });
      setSendWhatsApp(true);
    }
  }, [defaultCustomerId, activeCustomers, reset, isOpen, paymentToEdit]);

  const onSubmit = async (data: PaymentFormData) => {
    const amount = parseRupeesToPaise(data.amount_rupees);
    if (amount <= 0 || !selectedCustomer) return;

    setIsProcessing(true);
    try {
      const paymentPayload: PaymentInput = {
        id: paymentToEdit?.id,
        customer_id: parseInt(data.customer_id, 10),
        payment_date: data.payment_date,
        amount,
        payment_method: data.payment_method as PaymentMethod,
        reference_no: data.reference_no?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        status: paymentToEdit?.status || 'posted',
      };

      await onSave(paymentPayload);

      // Send Payment Receipt via WhatsApp if requested and customer has mobile
      if (sendWhatsApp && selectedCustomer.mobile) {
        try {
          const effectiveAgencyName = agencySettings?.agency_name || 'Satvik Milk Agency';
          const effectiveLogo = agencySettings?.logo_path || AGENCY_LOGO_BASE64;
          const dateStr = data.payment_date.replace(/-/g, '');
          const receiptCode = `RCP-PAY-${dateStr}-${selectedCustomer.customer_code || selectedCustomer.id}`;
          const headerColor = agencySettings?.receipt_header_color || '#00A8E8';

          const message = formatPaymentWhatsAppMessage({
            customerName: selectedCustomer.name,
            agencyName: effectiveAgencyName,
            agencyBrandLine: agencySettings?.receipt_brand_line,
            agencyPhone: agencySettings?.mobile,
            paymentAmountPaise: amount,
            paymentMethod: data.payment_method,
            paymentDate: formatDate(data.payment_date),
            receiptNo: receiptCode,
            referenceNo: data.reference_no?.trim() || undefined,
            previousBalancePaise,
            closingBalancePaise: projectedClosingBalance,
            notes: data.notes?.trim() || undefined,
          });

          if (receiptFormat === 'image') {
            const imageBlob = await generatePaymentReceiptImageBlob({
              agencyName: effectiveAgencyName,
              agencyAddress: agencySettings?.address,
              agencyMobile: agencySettings?.mobile,
              receiptBrandLine: agencySettings?.receipt_brand_line,
              receiptGst: agencySettings?.receipt_gst,
              logoBase64: effectiveLogo,
              receiptNo: receiptCode,
              date: formatDate(data.payment_date),
              customerName: selectedCustomer.name,
              customerCode: selectedCustomer.customer_code,
              customerMobile: selectedCustomer.mobile,
              paymentAmount: amount,
              paymentMethod: data.payment_method,
              referenceNo: data.reference_no?.trim() || undefined,
              previousBalance: previousBalancePaise,
              closingBalance: projectedClosingBalance,
              notes: data.notes?.trim() || undefined,
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
            const pdfBlob = await pdf(
              <PaymentReceiptDocument
                agencyName={effectiveAgencyName}
                agencyAddress={agencySettings?.address}
                agencyMobile={agencySettings?.mobile}
                receiptBrandLine={agencySettings?.receipt_brand_line}
                receiptGst={agencySettings?.receipt_gst}
                logoUrl={effectiveLogo}
                receiptNo={receiptCode}
                paymentDate={formatDate(data.payment_date)}
                customerName={selectedCustomer.name}
                customerCode={selectedCustomer.customer_code}
                customerMobile={selectedCustomer.mobile}
                paymentAmount={amount}
                paymentMethod={data.payment_method}
                referenceNo={data.reference_no?.trim() || undefined}
                previousBalance={previousBalancePaise}
                closingBalance={projectedClosingBalance}
                notes={data.notes?.trim() || undefined}
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
          console.error('Failed to share payment receipt via WhatsApp:', shareErr);
          if (selectedCustomer.mobile) {
            openWhatsAppShare(selectedCustomer.mobile);
          }
        }
      }

      onClose();
    } catch (err) {
      console.error('Error saving payment:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={paymentToEdit ? 'Edit Payment Receipt' : 'Record Payment & Send Receipt'}
      subtitle={
        paymentToEdit
          ? 'Update payment details and reconcile customer ledger balance'
          : 'Accept payment, automatically deduct from bill, and share receipt on WhatsApp'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {paymentToEdit && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
            <span>
              Editing Receipt <strong>#PAY-{paymentToEdit.id}</strong>
            </span>
            <span className="font-mono text-[11px] font-medium">Ledger Auto-Reconciles</span>
          </div>
        )}

        {/* Customer Select */}
        <div>
          <Select
            label="Customer"
            required
            disabled={!!paymentToEdit}
            error={errors.customer_id?.message}
            {...register('customer_id')}
          >
            {activeCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.customer_code}) {c.route_area ? `— ${c.route_area}` : ''}
              </option>
            ))}
          </Select>

          {selectedCustomer?.mobile && (
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>📱 Registered Mobile:</span>
              <span className="font-mono font-medium text-slate-800">{selectedCustomer.mobile}</span>
            </p>
          )}
        </div>

        {/* LIVE FINANCIAL CALCULATION BREAKDOWN */}
        {selectedCustomer && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                Ledger Balance Calculation
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Code: {selectedCustomer.customer_code}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-500 font-medium">Previous Balance</p>
                <p
                  className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${
                    previousBalancePaise > 0
                      ? 'text-rose-600'
                      : previousBalancePaise < 0
                      ? 'text-blue-600'
                      : 'text-slate-800'
                  }`}
                >
                  {formatPaiseAsINR(Math.abs(previousBalancePaise))}
                  <span className="text-[9px] font-normal ml-0.5 text-slate-500">
                    {previousBalancePaise > 0 ? 'Due' : previousBalancePaise < 0 ? 'Adv' : ''}
                  </span>
                </p>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs">
                <p className="text-[10px] text-emerald-700 font-medium">Paying Now</p>
                <p className="text-xs sm:text-sm font-bold font-mono mt-0.5 text-emerald-700">
                  -{formatPaiseAsINR(paymentAmountPaise)}
                </p>
              </div>

              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-500 font-medium">Remaining Due</p>
                <p
                  className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${
                    projectedClosingBalance > 0
                      ? 'text-rose-600'
                      : projectedClosingBalance < 0
                      ? 'text-blue-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {formatPaiseAsINR(Math.abs(projectedClosingBalance))}
                  <span className="text-[9px] font-normal ml-0.5 text-slate-500">
                    {projectedClosingBalance > 0
                      ? 'Due'
                      : projectedClosingBalance < 0
                      ? 'Adv'
                      : 'Cleared'}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Fill Buttons */}
            {previousBalancePaise > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setValue('amount_rupees', (previousBalancePaise / 100).toFixed(2))}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-800 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Pay Full Due (₹{(previousBalancePaise / 100).toFixed(2)})</span>
                </button>

                {[500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setValue('amount_rupees', amt.toString())}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium font-mono transition-colors cursor-pointer"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Payment Amount (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 1500.00"
            required
            error={errors.amount_rupees?.message}
            {...register('amount_rupees')}
          />
          <Input
            label="Payment Date"
            type="date"
            required
            error={errors.payment_date?.message}
            {...register('payment_date')}
          />
        </div>

        {/* Payment Mode & Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Select label="Payment Mode" {...register('payment_method')}>
            <option value="cash">💵 Cash Payment</option>
            <option value="upi">📱 UPI / QR Code</option>
            <option value="bank_transfer">🏦 Bank Transfer (NEFT/IMPS)</option>
            <option value="other">📝 Cheque / Other</option>
          </Select>
          <Input
            label="Transaction / UPI Ref No."
            placeholder="e.g. UPI-123456"
            error={errors.reference_no?.message}
            {...register('reference_no')}
          />
        </div>

        <Input
          label="Notes / Description (Optional)"
          placeholder="e.g. Received via PhonePe / Cash in hand"
          error={errors.notes?.message}
          {...register('notes')}
        />

        {/* WHATSAPP RECEIPT SHARING SECTION */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Send Payment Receipt on WhatsApp
              </span>
            </label>

            {sendWhatsApp && (
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-emerald-200">
                <button
                  type="button"
                  onClick={() => setReceiptFormat('image')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                    receiptFormat === 'image'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileImage className="w-3 h-3" />
                  PNG Slip
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptFormat('pdf')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                    receiptFormat === 'pdf'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  PDF
                </button>
              </div>
            )}
          </div>

          {sendWhatsApp && (
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Instantly opens WhatsApp with payment receipt showing <strong>Previous Balance</strong>,{' '}
              <strong>Amount Received</strong>, and <strong>Remaining Balance</strong>.
            </p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto min-h-11 justify-center"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            isLoading={isProcessing}
            className="w-full sm:w-auto min-h-11 justify-center shadow-sm"
          >
            {paymentToEdit ? 'Update & Reconcile' : 'Record & Send Receipt'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
