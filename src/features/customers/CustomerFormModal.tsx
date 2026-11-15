import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerInput, CustomerRecord } from '../../types/models';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { parseRupeesToPaise, paiseToRupees } from '../../lib/calculations/money';

const customerSchema = z.object({
  customer_code: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit mobile number').optional().or(z.literal('')),
  address: z.string().optional(),
  route_area: z.string().optional(),
  joining_date: z.string().min(10, 'Enter valid date'),
  opening_balance_rupees: z.string(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: CustomerInput) => Promise<void>;
  customerToEdit?: CustomerRecord | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customerToEdit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      mobile: '',
      address: '',
      route_area: '',
      joining_date: new Date().toISOString().slice(0, 10),
      opening_balance_rupees: '0',
      notes: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (customerToEdit) {
      reset({
        customer_code: customerToEdit.customer_code,
        name: customerToEdit.name,
        mobile: customerToEdit.mobile || '',
        address: customerToEdit.address || '',
        route_area: customerToEdit.route_area || '',
        joining_date: customerToEdit.joining_date || new Date().toISOString().slice(0, 10),
        opening_balance_rupees: paiseToRupees(customerToEdit.opening_balance).toString(),
        notes: customerToEdit.notes || '',
        status: customerToEdit.status as 'active' | 'inactive',
      });
    } else {
      reset({
        name: '',
        mobile: '',
        address: '',
        route_area: '',
        joining_date: new Date().toISOString().slice(0, 10),
        opening_balance_rupees: '0',
        notes: '',
        status: 'active',
      });
    }
  }, [customerToEdit, reset, isOpen]);

  const onSubmit = async (data: CustomerFormData) => {
    const opening_balance = parseRupeesToPaise(data.opening_balance_rupees);
    await onSave({
      id: customerToEdit?.id,
      customer_code: data.customer_code || undefined,
      name: data.name.trim(),
      mobile: data.mobile?.trim() || undefined,
      address: data.address?.trim() || undefined,
      route_area: data.route_area?.trim() || undefined,
      joining_date: data.joining_date,
      opening_balance,
      notes: data.notes?.trim() || undefined,
      status: data.status,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? 'Edit Customer Account' : 'Add New Customer'}
      subtitle="Configure delivery account profile, route & opening balance"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Mobile Number"
            placeholder="10-digit mobile"
            error={errors.mobile?.message}
            {...register('mobile')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Delivery Route / Area"
            placeholder="e.g. Bazar Peth, Sector 4"
            error={errors.route_area?.message}
            {...register('route_area')}
          />
          <Input
            label="Joining Date"
            type="date"
            required
            error={errors.joining_date?.message}
            {...register('joining_date')}
          />
        </div>

        <Input
          label="Street Address / House No."
          placeholder="Flat / Building, Landmark"
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Opening Balance (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            helperText="Positive = owes money; Negative = advance"
            error={errors.opening_balance_rupees?.message}
            {...register('opening_balance_rupees')}
          />
          <Select label="Account Status" {...register('status')}>
            <option value="active">Active Customer</option>
            <option value="inactive">Inactive / Suspended</option>
          </Select>
        </div>

        <Input
          label="Special Delivery Notes"
          placeholder="e.g. Ring bell twice, leave bag at door"
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto min-h-11 justify-center">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full sm:w-auto min-h-11 justify-center">
            {customerToEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
