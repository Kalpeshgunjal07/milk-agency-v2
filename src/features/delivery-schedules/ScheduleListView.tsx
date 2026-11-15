import React, { useMemo, useState } from 'react';
import { CustomerRecord, DeliveryScheduleRecord, ProductRecord } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { formatPaiseAsINR } from '../../lib/calculations/money';
import { formatDate } from '../../lib/formatters/date';
import {
  Plus,
  Edit3,
  Play,
  Pause,
  CalendarCheck,
  Milk,
  Users,
  Package,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';

interface ScheduleListViewProps {
  schedules: DeliveryScheduleRecord[];
  customers: CustomerRecord[];
  products: ProductRecord[];
  onAddSchedule: () => void;
  onEditSchedule: (schedule: DeliveryScheduleRecord) => void;
  onToggleStatus: (schedule: DeliveryScheduleRecord) => void;
  searchQuery: string;
}

export const ScheduleListView: React.FC<ScheduleListViewProps> = ({
  schedules,
  customers,
  products,
  onAddSchedule,
  onEditSchedule,
  onToggleStatus,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  // Metrics computation
  const metrics = useMemo(() => {
    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter((s) => s.status === 'active');
    const pausedSchedules = schedules.filter((s) => s.status === 'paused');

    const totalVolume = activeSchedules.reduce((sum, s) => sum + s.quantity, 0);
    const uniqueCustIds = new Set(activeSchedules.map((s) => s.customer_id)).size;
    const uniqueProdIds = new Set(activeSchedules.map((s) => s.product_id)).size;

    return {
      totalSchedules,
      activeCount: activeSchedules.length,
      pausedCount: pausedSchedules.length,
      totalVolume,
      uniqueCustIds,
      uniqueProdIds,
    };
  }, [schedules]);

  const filteredRows = useMemo(() => {
    return schedules
      .filter((s) => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (productFilter !== 'all' && s.product_id.toString() !== productFilter) return false;
        const customer = customers.find((c) => c.id === s.customer_id);
        const product = products.find((p) => p.id === s.product_id);
        if (customer?.deleted_at || product?.deleted_at) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const custName = customer?.name.toLowerCase() || '';
          const prodName = product?.name.toLowerCase() || '';
          const area = customer?.route_area?.toLowerCase() || '';
          return custName.includes(q) || prodName.includes(q) || area.includes(q);
        }
        return true;
      })
      .map((s) => {
        const customer = customers.find((c) => c.id === s.customer_id);
        const product = products.find((p) => p.id === s.product_id);
        return {
          ...s,
          customerName: customer?.name || `Customer #${s.customer_id}`,
          customerCode: customer?.customer_code || '',
          routeArea: customer?.route_area || 'Direct',
          productName: product?.name || `Product #${s.product_id}`,
          productUnit: product?.unit || 'Ltr',
          standardPrice: product?.default_selling_price || 0,
        };
      });
  }, [schedules, customers, products, statusFilter, productFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const allWeekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const dayLabels: Record<string, string> = {
    mon: 'M',
    tue: 'T',
    wed: 'W',
    thu: 'T',
    fri: 'F',
    sat: 'S',
    sun: 'S',
  };

  return (
    <div className="space-y-4">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 min-[360px]:gap-2.5 sm:gap-3.5">
        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Subscriptions</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-slate-900 mt-0.5 truncate">
              {metrics.activeCount}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-slate-400">
                ({metrics.pausedCount} Paused)
              </span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Daily Demand</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-blue-600 mt-0.5 font-mono truncate">
              {metrics.totalVolume.toFixed(1)}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-slate-500 font-sans">Ltr/day</span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Milk className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Subscribed Users</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-amber-600 mt-0.5 truncate">
              {metrics.uniqueCustIds}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-slate-400">Accounts</span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-2.5 min-[360px]:p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5 min-[360px]:pr-2">
            <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-normal text-slate-500 truncate">Subscribed SKUs</p>
            <p className="text-sm min-[360px]:text-base sm:text-lg font-semibold text-indigo-600 mt-0.5 truncate">
              {metrics.uniqueProdIds}{' '}
              <span className="text-[10px] min-[360px]:text-xs font-normal text-slate-400">Products</span>
            </p>
          </div>
          <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {(['all', 'active', 'paused'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setStatusFilter(mode);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  statusFilter === mode
                    ? 'bg-blue-600 text-white font-medium shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button variant="primary" size="sm" onClick={onAddSchedule} className="w-full sm:w-auto min-h-10.5 justify-center">
            <Plus className="w-3.5 h-3.5" /> New Subscription
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <select
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <span className="text-slate-400 font-normal">
            Showing {filteredRows.length} subscriptions
          </span>
        </div>
      </div>

      {/* MOBILE SCHEDULE CARDS VIEW */}
      <div className="space-y-3 md:hidden">
        {paginatedRows.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No subscriptions match the filter.
          </div>
        ) : (
          paginatedRows.map((s) => {
            const isPaused = s.status === 'paused';
            const activeDays = (s.delivery_days || '')
              .toLowerCase()
              .split(',')
              .map((d: string) => d.trim());

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-3 min-[360px]:p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-xs min-[360px]:text-sm text-slate-900 leading-tight truncate">
                        {s.customerName}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        {s.customerCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.routeArea}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shrink-0 whitespace-nowrap ${
                      !isPaused
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        !isPaused ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {!isPaused ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Milk className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-slate-800 block truncate">{s.productName}</span>
                      <span className="font-mono font-semibold text-blue-700 text-xs block truncate">
                        {s.quantity} {s.productUnit} / day
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 whitespace-nowrap">
                    <span className="text-slate-400 text-[10px] block">Rate Applied</span>
                    <span className="font-mono font-semibold text-slate-800 text-xs">
                      {formatPaiseAsINR(s.custom_price || s.standardPrice)}
                    </span>
                    {s.custom_price && (
                      <span className="text-[10px] text-amber-600 block">Custom Rate</span>
                    )}
                  </div>
                </div>

                {/* Weekday Matrix Chips */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Delivery Days:</span>
                  <div className="flex items-center gap-1">
                    {allWeekdays.map((day) => {
                      const isActive = activeDays.includes(day);
                      return (
                        <span
                          key={day}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-semibold ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {dayLabels[day]}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onToggleStatus(s)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-11 rounded-xl border font-medium text-xs transition-colors cursor-pointer ${
                      isPaused
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 active:bg-amber-200'
                    }`}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={() => onEditSchedule(s)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-11 rounded-xl bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 text-slate-700 hover:text-indigo-600 border border-slate-200 font-medium text-xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
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
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Subscribed Product</th>
                <th className="py-3.5 px-4">Daily Volume</th>
                <th className="py-3.5 px-4">Weekday Matrix</th>
                <th className="py-3.5 px-4">Price Applied</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((s) => {
                  const isPaused = s.status === 'paused';
                  const activeDays = (s.delivery_days || '')
                    .toLowerCase()
                    .split(',')
                    .map((d: string) => d.trim());

                  return (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {s.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {s.customerCode} • {s.routeArea}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Milk className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="font-medium text-slate-800">{s.productName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {s.quantity} {s.productUnit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {allWeekdays.map((day) => {
                            const isActive = activeDays.includes(day);
                            return (
                              <span
                                key={day}
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-semibold ${
                                  isActive
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {dayLabels[day]}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-800">
                          {formatPaiseAsINR(s.custom_price || s.standardPrice)}
                        </div>
                        {s.custom_price && (
                          <span className="text-[10px] text-amber-600 font-medium">Custom Rate</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-normal">
                        {formatDate(s.start_date)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            !isPaused
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              !isPaused ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {!isPaused ? 'Active' : 'Paused'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onToggleStatus(s)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                              isPaused
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                            <span>{isPaused ? 'Resume' : 'Pause'}</span>
                          </button>
                          <button
                            onClick={() => onEditSchedule(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
};
