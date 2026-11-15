import React, { useMemo, useState } from 'react';
import { ProductRecord } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatPaiseAsINR } from '../../lib/calculations/money';
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  Milk,
  Layers,
  Sparkles,
  Percent,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';

interface ProductListViewProps {
  products: ProductRecord[];
  onAddProduct: () => void;
  onEditProduct: (product: ProductRecord) => void;
  onDeleteProduct?: (id: number) => Promise<void>;
  searchQuery: string;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  searchQuery,
}) => {
  const [productToDelete, setProductToDelete] = useState<ProductRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const activeProducts = useMemo(() => {
    return products.filter((p) => !p.deleted_at);
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    activeProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [activeProducts]);

  // Metric statistics
  const metrics = useMemo(() => {
    const totalProducts = activeProducts.length;
    const activeProductsCount = activeProducts.filter((p) => p.status === 'active').length;
    const milkProducts = activeProducts.filter((p) =>
      p.category.toLowerCase().includes('milk')
    );
    const byproducts = activeProducts.filter(
      (p) => !p.category.toLowerCase().includes('milk')
    );

    const avgPricePaise =
      milkProducts.length > 0
        ? Math.round(
            milkProducts.reduce((sum, p) => sum + p.default_selling_price, 0) /
              milkProducts.length
          )
        : 0;

    return {
      totalProducts,
      activeCount: activeProductsCount,
      milkCount: milkProducts.length,
      byproductCount: byproducts.length,
      avgPricePaise,
    };
  }, [activeProducts]);

  const filteredRows = useMemo(() => {
    const result = activeProducts.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.product_code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'price') cmp = a.default_selling_price - b.default_selling_price;
      else if (sortBy === 'category') cmp = a.category.localeCompare(b.category);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [activeProducts, categoryFilter, statusFilter, searchQuery, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const handleToggleSort = (field: 'name' | 'price' | 'category') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Dairy SKUs</p>
            <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5 truncate">
              {metrics.totalProducts}{' '}
              <span className="text-xs font-normal text-emerald-600">
                ({metrics.activeCount} Active)
              </span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Milk Variants</p>
            <p className="text-base sm:text-lg font-semibold text-blue-600 mt-0.5 truncate">
              {metrics.milkCount}{' '}
              <span className="text-xs font-normal text-slate-400">Listed</span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Milk className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Byproducts</p>
            <p className="text-base sm:text-lg font-semibold text-amber-600 mt-0.5 truncate">
              {metrics.byproductCount}{' '}
              <span className="text-xs font-normal text-slate-400">Curd/Ghee</span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate">Avg. Milk Rate</p>
            <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5 font-mono truncate">
              {formatPaiseAsINR(metrics.avgPricePaise)}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">/ Ltr</span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Scrollable Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategoryFilter(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white font-medium shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Button variant="primary" size="sm" onClick={onAddProduct} className="w-full sm:w-auto min-h-10.5 justify-center">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <span className="text-slate-400 font-normal">
            Showing {filteredRows.length} products
          </span>
        </div>
      </div>

      {/* MOBILE PRODUCT CARDS VIEW */}
      <div className="space-y-3 md:hidden">
        {paginatedRows.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            {activeProducts.length === 0 ? (
              <div className="py-4 space-y-2">
                <Package className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700">No products added yet</p>
                <p className="text-[11px] text-slate-400">Click '+ Add Product' above to create your first product.</p>
              </div>
            ) : (
              'No products match the filter.'
            )}
          </div>
        ) : (
          paginatedRows.map((p) => {
            const isMilk = p.category.toLowerCase().includes('milk');
            const marginPaise = p.cost_price ? p.default_selling_price - p.cost_price : null;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isMilk
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}
                    >
                      {isMilk ? <Milk className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm text-slate-900 leading-tight truncate">
                          {p.name}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {p.product_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {p.description || 'Dairy SKU'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 whitespace-nowrap ${
                      p.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        p.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {p.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-slate-400 text-[10px] block">Selling Price</span>
                    <span className="font-mono font-semibold text-sm text-blue-700 truncate block">
                      {formatPaiseAsINR(p.default_selling_price)}{' '}
                      <span className="text-xs font-normal text-slate-500 font-sans">
                        / {p.unit}
                      </span>
                    </span>
                  </div>

                  {marginPaise !== null && (
                    <div className="text-right shrink-0 whitespace-nowrap">
                      <span className="text-slate-400 text-[10px] block">Profit Margin</span>
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700">
                        <Percent className="w-3 h-3" />
                        {Math.round((marginPaise / p.default_selling_price) * 100)}% (
                        {formatPaiseAsINR(marginPaise)})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onEditProduct(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-11 rounded-xl bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 text-slate-700 hover:text-indigo-600 border border-slate-200 font-medium text-xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Product</span>
                  </button>
                  {onDeleteProduct && (
                    <button
                      onClick={() => setProductToDelete(p)}
                      title="Delete Product"
                      className="p-2.5 min-h-11 min-w-11 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 border border-slate-200 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
                <th className="py-3.5 px-4">SKU Code</th>
                <th
                  onClick={() => handleToggleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Details</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort('category')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Unit</th>
                <th
                  onClick={() => handleToggleSort('price')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Selling Rate</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Cost & Margin</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {activeProducts.length === 0 ? (
                      <div className="py-4 space-y-2">
                        <Package className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="font-semibold text-slate-700">No products added yet</p>
                        <p className="text-xs text-slate-400">Click '+ Add Product' to create your first dairy or agency product.</p>
                      </div>
                    ) : (
                      'No dairy products match your search.'
                    )}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((p) => {
                  const isMilk = p.category.toLowerCase().includes('milk');
                  const marginPaise = p.cost_price
                    ? p.default_selling_price - p.cost_price
                    : null;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => onEditProduct(p)}
                    >
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {p.product_code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isMilk
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}
                          >
                            {isMilk ? <Milk className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {p.description || 'Standard dairy catalog item'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            isMilk
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {p.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-xs text-blue-700">
                          {formatPaiseAsINR(p.default_selling_price)}{' '}
                          <span className="text-[11px] text-slate-400 font-normal font-sans">
                            / {p.unit}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.cost_price && marginPaise !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500">
                              {formatPaiseAsINR(p.cost_price)}
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Percent className="w-2.5 h-2.5" />
                              {Math.round((marginPaise / p.default_selling_price) * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            p.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {p.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditProduct(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          {onDeleteProduct && (
                            <button
                              onClick={() => setProductToDelete(p)}
                              title="Delete Product"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-xs">
          <div className="text-slate-500 font-normal">
            Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Product Move to Bin Confirmation Modal */}
      {productToDelete && (
        <Modal
          isOpen={!!productToDelete}
          onClose={() => !isDeleting && setProductToDelete(null)}
          title="Move Product to Bin"
          subtitle="Move product to the Recycle Bin with full restore capability"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-950">
                  Move this dairy product to the Recycle Bin?
                </p>
                <p className="text-amber-800 leading-relaxed">
                  <strong>{productToDelete.name} ({productToDelete.product_code})</strong> will be moved to the Recycle Bin and hidden from the active catalog. Historical delivery records remain intact, and you can restore this product anytime from the Recycle Bin in the sidebar.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Product Name:</span>
                <span className="font-semibold text-slate-800">{productToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SKU Code:</span>
                <span className="font-mono text-slate-800">{productToDelete.product_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="text-slate-800">{productToDelete.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selling Price:</span>
                <span className="font-mono font-semibold text-blue-700">
                  {formatPaiseAsINR(productToDelete.default_selling_price)} / {productToDelete.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={isDeleting}
                onClick={async () => {
                  if (!productToDelete?.id || !onDeleteProduct) return;
                  try {
                    setIsDeleting(true);
                    await onDeleteProduct(productToDelete.id);
                    setProductToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                Move to Bin
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
