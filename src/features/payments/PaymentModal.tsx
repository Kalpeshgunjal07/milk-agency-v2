import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerRecord, PaymentInput, PaymentRecord } from '../../types/models';
import { PaymentMethod } from '../../types/enums';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { parseRupeesToPaise, formatPaiseAsINR } from '../../lib/calculations/money';

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
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  defaultCustomerId,
  paymentToEdit,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
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

  const selectedCustId = watch('customer_id');
  const selectedCustomer = customers.find((c) => c.id?.toString() === selectedCustId);

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
    } else {
      reset({
        customer_id: defaultCustomerId
          ? defaultCustomerId.toString()
          : (customers[0]?.id?.toString() ?? ''),
        payment_date: new Date().toISOString().slice(0, 10),
        amount_rupees: '',
        payment_method: 'cash',
        reference_no: '',
        notes: '',
      });
    }
  }, [defaultCustomerId, customers, reset, isOpen, paymentToEdit]);

  const onSubmit = async (data: PaymentFormData) => {
    const amount = parseRupeesToPaise(data.amount_rupees);
    if (amount <= 0) return;

    await onSave({
      id: paymentToEdit?.id,
      customer_id: parseInt(data.customer_id, 10),
      payment_date: data.payment_date,
      amount,
      payment_method: data.payment_method as PaymentMethod,
      reference_no: data.reference_no?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      status: paymentToEdit?.status || 'posted',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={paymentToEdit ? 'Edit Payment Receipt' : 'Record Payment Receipt'}
      subtitle={
        paymentToEdit
          ? 'Update payment amount, date or mode and reconcile customer ledger'
          : 'Accept Cash, UPI or Bank transfer payment and post to customer ledger'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {paymentToEdit && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
            <span>Editing Receipt <strong>#PAY-{paymentToEdit.id}</strong></span>
            <span className="font-mono text-[11px] font-medium">Ledger Auto-Reconciles</span>
          </div>
        )}

        <Select
          label="Customer"
          required
          disabled={!!paymentToEdit}
          error={errors.customer_id?.message}
          {...register('customer_id')}
        >
          {customers
            .filter((c) => !c.deleted_at || c.id === paymentToEdit?.customer_id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.customer_code}) {c.route_area ? `— ${c.route_area}` : ''}
              </option>
            ))}
        </Select>

        {selectedCustomer && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Opening Balance Recorded:</span>
            <span className="font-mono font-bold text-slate-800">
              {formatPaiseAsINR(selectedCustomer.opening_balance)}
            </span>
          </div>
        )}

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
          label="Internal Notes (Optional)"
          placeholder="e.g. Received via GPay from Rahul's brother"
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto min-h-11 justify-center">
            Cancel
          </Button>
          <Button type="submit" variant="success" isLoading={isSubmitting} className="w-full sm:w-auto min-h-11 justify-center">
            {paymentToEdit ? 'Update & Reconcile' : 'Record & Credit Ledger'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
