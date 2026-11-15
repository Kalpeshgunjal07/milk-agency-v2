import React, { useState, useMemo } from 'react';
import { CustomerRecord, DeliveryRecord, PaymentRecord, ProductRecord } from '../../types/models';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPaiseAsINR } from '../../lib/calculations/money';
import { Download, TrendingUp, DollarSign, Package } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ReportsViewProps {
  customers: CustomerRecord[];
  products: ProductRecord[];
  deliveries: DeliveryRecord[];
  payments: PaymentRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  customers,
  products,
  deliveries,
  payments,
}) => {
  const [reportType, setReportType] = useState<'sales' | 'collections' | 'products'>('sales');

  const productSalesMap = useMemo(() => {
    const map = new Map<number, { name: string; unit: string; totalQty: number; totalAmt: number }>();

    deliveries.forEach((d) => {
      if (d.items && d.items.length > 0) {
        d.items.forEach((it) => {
          const ex = map.get(it.product_id) || {
            name: it.product_name_snapshot,
            unit: it.unit_snapshot,
            totalQty: 0,
            totalAmt: 0,
          };
          ex.totalQty += it.quantity;
          ex.totalAmt += it.line_amount;
          map.set(it.product_id, ex);
        });
      } else {
        const pId = d.product_id || 1;
        const prod = products.find((p) => p.id === pId);
        const ex = map.get(pId) || {
          name: prod?.name || `Product #${pId}`,
          unit: prod?.unit || 'Ltr',
          totalQty: 0,
          totalAmt: 0,
        };
        ex.totalQty += d.total_quantity;
        ex.totalAmt += d.total_amount;
        map.set(pId, ex);
      }
    });

    return Array.from(map.values()).map((p) => ({
      ...p,
      totalQty: parseFloat(p.totalQty.toFixed(2)),
      amountRupees: p.totalAmt / 100,
    }));
  }, [deliveries, products]);

  const totalSales = deliveries.reduce((sum, d) => sum + (d.total_amount || 0), 0);
  const totalCollections = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'products') {
      csvContent += 'Product,Unit,Total Quantity,Total Amount (INR)\n';
      productSalesMap.forEach((p) => {
        csvContent += `"${p.name}","${p.unit}",${p.totalQty},${p.amountRupees}\n`;
      });
    } else {
      csvContent += 'Date,Type,Customer,Amount (INR)\n';
      deliveries.forEach((d) => {
        const cust = customers.find((c) => c.id === d.customer_id);
        csvContent += `"${d.delivery_date}","Delivery","${cust?.name || 'Customer'}",${d.total_amount / 100}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `milk_agency_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <span className="text-xs font-medium text-slate-500 shrink-0 mr-1">Report View:</span>
          {(['sales', 'collections', 'products'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setReportType(r)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                reportType === r
                  ? 'bg-blue-600 text-white shadow-2xs font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCsv} className="w-full sm:w-auto min-h-10.5 justify-center">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card>
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs text-slate-400 font-normal truncate">Lifetime Sales Volume</p>
              <p className="text-base sm:text-lg font-semibold text-slate-800 mt-0.5 truncate">{formatPaiseAsINR(totalSales)}</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs text-slate-400 font-normal truncate">Total Collections</p>
              <p className="text-base sm:text-lg font-semibold text-emerald-600 mt-0.5 truncate">{formatPaiseAsINR(totalCollections)}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs text-slate-400 font-normal truncate">Active Dairy Catalog</p>
              <p className="text-base sm:text-lg font-semibold text-slate-800 mt-0.5 truncate">{products.length} SKUs</p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product-wise Volume Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-semibold">Product-Wise Delivered Revenue (₹)</CardTitle>
        </CardHeader>
        <CardContent className="h-60 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productSalesMap} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', fontFamily: 'Poppins' }}
              />
              <Bar dataKey="amountRupees" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabular Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-semibold">Product Sales Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Product Name</th>
                  <th className="px-4 py-2.5 text-right">Quantity</th>
                  <th className="px-4 py-2.5">Unit</th>
                  <th className="px-4 py-2.5 text-right">Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productSalesMap.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2 font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-2 text-right font-mono font-normal text-slate-700">{p.totalQty}</td>
                    <td className="px-4 py-2 text-slate-400 font-normal">{p.unit}</td>
                    <td className="px-4 py-2 text-right font-mono font-medium text-blue-600">
                      {formatPaiseAsINR(p.totalAmt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
