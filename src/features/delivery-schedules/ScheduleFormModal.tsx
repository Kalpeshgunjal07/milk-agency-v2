import React, { useEffect, useState } from 'react';
import { CustomerRecord, DeliveryScheduleInput, DeliveryScheduleRecord, ProductRecord } from '../../types/models';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { parseRupeesToPaise, paiseToRupees } from '../../lib/calculations/money';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: DeliveryScheduleInput) => Promise<void>;
  customers: CustomerRecord[];
  products: ProductRecord[];
  scheduleToEdit?: DeliveryScheduleRecord | null;
  defaultCustomerId?: number;
}

const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  products,
  scheduleToEdit,
  defaultCustomerId,
}) => {
  const [customerId, setCustomerId] = useState<number>(0);
  const [productId, setProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [customPriceRupees, setCustomPriceRupees] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<string[]>([...ALL_DAYS]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'paused' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (scheduleToEdit) {
      setCustomerId(scheduleToEdit.customer_id);
      setProductId(scheduleToEdit.product_id);
      setQuantity(scheduleToEdit.quantity);
      setCustomPriceRupees(scheduleToEdit.custom_price ? paiseToRupees(scheduleToEdit.custom_price).toString() : '');
      setSelectedDays(scheduleToEdit.delivery_days.split(',').filter(Boolean));
      setStartDate(scheduleToEdit.start_date);
      setEndDate(scheduleToEdit.end_date || '');
      setStatus(scheduleToEdit.status as any);
    } else {
      setCustomerId(defaultCustomerId || (customers[0]?.id ?? 0));
      setProductId(products[0]?.id ?? 0);
      setQuantity(1);
      setCustomPriceRupees('');
      setSelectedDays([...ALL_DAYS]);
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate('');
      setStatus('active');
    }
  }, [scheduleToEdit, defaultCustomerId, customers, products, isOpen]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSelectAllDays = () => setSelectedDays([...ALL_DAYS]);
  const handleSelectWeekdays = () => setSelectedDays(['mon', 'tue', 'wed', 'thu', 'fri']);
  const handleSelectWeekends = () => setSelectedDays(['sat', 'sun']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !productId || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      const custom_price = customPriceRupees ? parseRupeesToPaise(customPriceRupees) : undefined;
      await onSave({
        id: scheduleToEdit?.id,
        customer_id: Number(customerId),
        product_id: Number(productId),
        quantity: Number(quantity),
        delivery_days: selectedDays.join(','),
        custom_price,
        start_date: startDate,
        end_date: endDate || undefined,
        status,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={scheduleToEdit ? 'Edit Regular Delivery Subscription' : 'New Recurring Subscription'}
      subtitle="Configure recurring delivery quantities and active weekdays"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Customer"
          value={customerId}
          onChange={(e) => setCustomerId(Number(e.target.value))}
          required
        >
          {customers
            .filter((c) => !c.deleted_at || c.id === scheduleToEdit?.customer_id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.customer_code}) {c.route_area ? `— ${c.route_area}` : ''}
              </option>
            ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Select
            label="Product"
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            required
          >
            {products.filter((p) => !p.deleted_at || p.id === scheduleToEdit?.product_id).length === 0 ? (
              <option disabled value="">No products available. Add in Products section first.</option>
            ) : (
              products
                .filter((p) => !p.deleted_at || p.id === scheduleToEdit?.product_id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.unit})
                  </option>
                ))
            )}
          </Select>

          <Input
            label="Daily Quantity"
            type="number"
            step="0.25"
            min="0.25"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
            required
          />
        </div>

        {/* Delivery Days Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Active Delivery Days
            </label>
            <div className="flex gap-2 text-[11px] text-blue-600 font-medium">
              <button type="button" onClick={handleSelectAllDays} className="hover:underline cursor-pointer">
                All
              </button>
              <span>•</span>
              <button type="button" onClick={handleSelectWeekdays} className="hover:underline cursor-pointer">
                Mon-Fri
              </button>
              <span>•</span>
              <button type="button" onClick={handleSelectWeekends} className="hover:underline cursor-pointer">
                Sat-Sun
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 pt-1">
            {ALL_DAYS.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-1.5 min-[360px]:py-2 px-0.5 text-[10px] min-[360px]:text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Custom Rate Override (₹)"
            type="number"
            step="0.01"
            placeholder="Leave blank for standard"
            value={customPriceRupees}
            onChange={(e) => setCustomPriceRupees(e.target.value)}
            helperText="Overrides product base rate"
          />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="active">Active (Deliver daily)</option>
            <option value="paused">Paused (Customer away)</option>
            <option value="inactive">Cancelled</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End Date (Optional)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            helperText="Leave empty for ongoing"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto min-h-11 justify-center">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full sm:w-auto min-h-11 justify-center">
            {scheduleToEdit ? 'Save Changes' : 'Create Subscription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
