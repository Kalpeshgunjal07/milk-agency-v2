import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProductInput, ProductRecord } from '../../types/models';
import { UnitType } from '../../types/enums';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { parseRupeesToPaise, paiseToRupees } from '../../lib/calculations/money';

const productSchema = z.object({
  product_code: z.string().optional(),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  unit: z.enum(['Litre', 'Millilitre', 'Kilogram', 'Gram', 'Piece', 'Packet']),
  selling_price_rupees: z.string().min(1, 'Price is required'),
  cost_price_rupees: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductInput) => Promise<void>;
  productToEdit?: ProductRecord | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: 'Milk',
      unit: 'Litre',
      selling_price_rupees: '',
      cost_price_rupees: '',
      description: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (productToEdit) {
      reset({
        product_code: productToEdit.product_code,
        name: productToEdit.name,
        category: productToEdit.category,
        unit: productToEdit.unit as UnitType,
        selling_price_rupees: paiseToRupees(productToEdit.default_selling_price).toString(),
        cost_price_rupees: productToEdit.cost_price ? paiseToRupees(productToEdit.cost_price).toString() : '',
        description: productToEdit.description || '',
        status: productToEdit.status as 'active' | 'inactive',
      });
    } else {
      reset({
        name: '',
        category: 'Milk',
        unit: 'Litre',
        selling_price_rupees: '',
        cost_price_rupees: '',
        description: '',
        status: 'active',
      });
    }
  }, [productToEdit, reset, isOpen]);

  const onSubmit = async (data: ProductFormData) => {
    const default_selling_price = parseRupeesToPaise(data.selling_price_rupees);
    const cost_price = data.cost_price_rupees ? parseRupeesToPaise(data.cost_price_rupees) : undefined;

    await onSave({
      id: productToEdit?.id,
      product_code: data.product_code || undefined,
      name: data.name.trim(),
      category: data.category.trim(),
      unit: data.unit as UnitType,
      default_selling_price,
      cost_price,
      description: data.description?.trim() || undefined,
      status: data.status,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Dairy Product' : 'Add New Product'}
      subtitle="Configure SKU name, category, unit & standard selling rates"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Product Name"
          placeholder="e.g. Cow Milk Fresh, Paneer, Curd"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Category"
            placeholder="Milk, Curd, Ghee, Sweets"
            required
            error={errors.category?.message}
            {...register('category')}
          />
          <Select label="Unit of Measure" {...register('unit')}>
            <option value="Litre">Litre (L)</option>
            <option value="Millilitre">Millilitre (ml)</option>
            <option value="Kilogram">Kilogram (kg)</option>
            <option value="Gram">Gram (g)</option>
            <option value="Piece">Piece / Unit</option>
            <option value="Packet">Packet</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Default Selling Price (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 60.00"
            required
            error={errors.selling_price_rupees?.message}
            {...register('selling_price_rupees')}
          />
          <Input
            label="Cost / Purchase Price (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 48.00"
            helperText="Optional"
            {...register('cost_price_rupees')}
          />
        </div>

        <Input
          label="Description / Packaging Notes"
          placeholder="e.g. 500ml pouch, A2 Quality"
          error={errors.description?.message}
          {...register('description')}
        />

        <Select label="Product Status" {...register('status')}>
          <option value="active">Active (Available for delivery)</option>
          <option value="inactive">Inactive / Discontinued</option>
        </Select>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto min-h-11 justify-center">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full sm:w-auto min-h-11 justify-center">
            {productToEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
