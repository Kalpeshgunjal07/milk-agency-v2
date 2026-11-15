import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatPaiseForPDF } from '../calculations/money';
import { AGENCY_LOGO_BASE64 } from '../logoBase64';

const a4Styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  headerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#00A8E8',
    paddingBottom: 10,
    marginBottom: 10,
  },
  agencyDetails: {
    flex: 1,
    paddingRight: 12,
  },
  agencyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  agencySubtitle: {
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 1.3,
  },
  agencyContact: {
    fontSize: 8,
    color: '#00A8E8',
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  logoAndBillBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  billTitleBlock: {
    alignItems: 'flex-end',
  },
  billTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#00A8E8',
    textTransform: 'uppercase',
  },
  billMeta: {
    fontSize: 7.5,
    color: '#475569',
    marginTop: 2,
  },

  // Customer Details & Settlement Status Banner
  customerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },

  // 5 Financial Metric Highlight Cards (Exact Match to Desktop BillingView)
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 5,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    padding: 6,
  },
  metricCardHighlight: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  metricLabel: {
    fontSize: 6.5,
    color: '#64748B',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },
  metricValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
    marginTop: 2,
  },

  // Section Titles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 7.5,
    color: '#94A3B8',
  },

  // Enclosed Table Styling (Matching Desktop)
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 4.5,
    paddingHorizontal: 5,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#334155',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3.5,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    fontSize: 7.5,
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },

  // Table Columns for Date-wise Log
  colDate: { width: '15%' },
  colSession: { width: '12%' },
  colItems: { width: '38%' },
  colAmt: { width: '12%', textAlign: 'right' },
  colPaid: { width: '11%', textAlign: 'right' },
  colStatus: { width: '12%', textAlign: 'center' },

  // Summary Grid (Product Summary & Settlement)
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    alignItems: 'flex-start',
    gap: 8,
  },
  productCard: {
    flex: 1.1,
  },
  summaryCard: {
    flex: 0.9,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3.5,
    fontSize: 7.5,
    color: '#475569',
  },
  finalDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#00A8E8',
    paddingTop: 5,
    marginTop: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#0F172A',
  },
  footer: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 7.5,
    color: '#94A3B8',
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
  },
});

export interface MonthlyBillDeliveryEntry {
  id?: number | string;
  date: string;
  session: string;
  itemsDescription: string;
  deliveryAmount: number;
  paidAmount: number;
  paymentStatus: string;
  runningBalance?: number;
}

export interface MonthlyBillPaymentEntry {
  id?: number | string;
  date: string;
  paymentMethod: string;
  referenceNo?: string;
  amount: number;
}

export interface MonthlyBillProps {
  agencyName: string;
  agencyAddress?: string;
  agencyMobile?: string;
  agencyGst?: string;
  logoUrl?: string;
  billNumber: string;
  billTitle?: string;
  periodStart: string;
  periodEnd: string;
  customerName: string;
  customerCode: string;
  customerAddress?: string;
  customerMobile?: string;
  dailyEntries: MonthlyBillDeliveryEntry[];
  paymentsList?: MonthlyBillPaymentEntry[];
  productSummary: {
    productName: string;
    totalQuantity: number;
    unit: string;
    rate: number;
    totalAmount: number;
  }[];
  openingBalance: number;
  totalCharges: number;
  totalPayments: number;
  closingBalance: number;
  footerNote?: string;
  headerColor?: string;
}

export const MonthlyBillDocument: React.FC<MonthlyBillProps> = ({
  agencyName,
  agencyAddress,
  agencyMobile,
  agencyGst,
  logoUrl,
  billNumber,
  billTitle = 'MONTHLY STATEMENT',
  periodStart,
  periodEnd,
  customerName,
  customerCode,
  customerAddress,
  customerMobile,
  dailyEntries,
  paymentsList = [],
  productSummary,
  openingBalance,
  totalCharges,
  totalPayments,
  closingBalance,
  footerNote,
  headerColor = '#00A8E8',
}) => {
  const effectiveLogo = logoUrl || AGENCY_LOGO_BASE64;

  const isFullySettled = closingBalance <= 0;
  const isPartiallyPaid = totalPayments > 0 && closingBalance > 0;

  return (
    <Document>
      <Page size="A4" style={a4Styles.page}>
        {/* Banner with Agency & Circular Logo */}
        <View style={a4Styles.headerBanner}>
          <View style={a4Styles.agencyDetails}>
            <Text style={a4Styles.agencyName}>{agencyName}</Text>
            {agencyAddress && <Text style={a4Styles.agencySubtitle}>{agencyAddress}</Text>}
            {agencyMobile && <Text style={a4Styles.agencyContact}>Tel: {agencyMobile}</Text>}
            {agencyGst && <Text style={a4Styles.agencySubtitle}>GSTIN: {agencyGst}</Text>}
          </View>
          <View style={a4Styles.logoAndBillBlock}>
            <View style={a4Styles.logoContainer}>
              <Image src={effectiveLogo} style={a4Styles.logo} />
            </View>
            <View style={a4Styles.billTitleBlock}>
              <Text style={a4Styles.billTitle}>{billTitle}</Text>
              <Text style={a4Styles.billMeta}>Bill No: {billNumber}</Text>
              <Text style={a4Styles.billMeta}>Period: {periodStart} to {periodEnd}</Text>
            </View>
          </View>
        </View>

        {/* Customer Info & Statement Settlement Status Banner */}
        <View style={a4Styles.customerBanner}>
          <View style={{ flex: 1.4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#00A8E8', textTransform: 'uppercase' }}>
              Billed To:
            </Text>
            <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginTop: 1 }}>
              {customerName}
            </Text>
            <Text style={{ fontSize: 7.5, color: '#64748B', marginTop: 1 }}>
              Customer Code: {customerCode}
            </Text>
            {customerAddress && (
              <Text style={{ fontSize: 7.5, color: '#64748B', marginTop: 1 }}>
                Address: {customerAddress}
              </Text>
            )}
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
            {customerMobile && (
              <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#00A8E8' }}>
                Tel: {customerMobile}
              </Text>
            )}
            <View
              style={{
                marginTop: 2,
                paddingVertical: 2,
                paddingHorizontal: 6,
                borderRadius: 4,
                backgroundColor: isFullySettled ? '#DCFCE7' : isPartiallyPaid ? '#DBEAFE' : '#FFE4E6',
              }}
            >
              <Text
                style={{
                  fontSize: 7.5,
                  fontFamily: 'Helvetica-Bold',
                  color: isFullySettled ? '#166534' : isPartiallyPaid ? '#1E40AF' : '#9F1239',
                }}
              >
                {isFullySettled ? 'PAID & SETTLED' : isPartiallyPaid ? 'PARTIALLY PAID' : 'PAYMENT DUE'}
              </Text>
            </View>
            <Text style={{ fontSize: 7, color: '#64748B', marginTop: 2 }}>
              Date of Issue: {new Date().toLocaleDateString('en-IN')}
            </Text>
          </View>
        </View>

        {/* 5 Financial Metric Highlight Cards (Exact Match to Desktop Statement View) */}
        <View style={a4Styles.metricsGrid}>
          <View style={a4Styles.metricCard}>
            <Text style={a4Styles.metricLabel}>Previous Due</Text>
            <Text style={a4Styles.metricValue}>{formatPaiseForPDF(openingBalance)}</Text>
          </View>
          <View style={a4Styles.metricCard}>
            <Text style={a4Styles.metricLabel}>Deliveries Total</Text>
            <Text style={[a4Styles.metricValue, { color: '#0F172A' }]}>+{formatPaiseForPDF(totalCharges)}</Text>
          </View>
          <View style={a4Styles.metricCard}>
            <Text style={a4Styles.metricLabel}>Payments</Text>
            <Text style={[a4Styles.metricValue, { color: '#16A34A' }]}>-{formatPaiseForPDF(totalPayments)}</Text>
          </View>
          <View style={[a4Styles.metricCard, a4Styles.metricCardHighlight]}>
            <Text style={[a4Styles.metricLabel, { color: '#0369A1' }]}>Total Due</Text>
            <Text style={[a4Styles.metricValue, { color: '#075985' }]}>
              {isFullySettled ? 'Rs. 0.00 (Settled)' : formatPaiseForPDF(closingBalance)}
            </Text>
          </View>
          <View style={a4Styles.metricCard}>
            <Text style={a4Styles.metricLabel}>Delivery Days</Text>
            <Text style={a4Styles.metricValue}>{dailyEntries.length} Deliveries</Text>
          </View>
        </View>

        {/* 1. Date-Wise Delivery Register */}
        <View style={a4Styles.sectionHeaderRow}>
          <Text style={a4Styles.sectionTitle}>
            1. Date-Wise Delivery Register
          </Text>
          <Text style={a4Styles.sectionSubtitle}>
            {dailyEntries.length} delivery records in period
          </Text>
        </View>

        <View style={a4Styles.tableContainer}>
          <View style={a4Styles.tableHeader}>
            <Text style={a4Styles.colDate}>DATE</Text>
            <Text style={a4Styles.colSession}>SHIFT</Text>
            <Text style={a4Styles.colItems}>DELIVERED PRODUCTS</Text>
            <Text style={a4Styles.colAmt}>DELIVERY (INR)</Text>
            <Text style={a4Styles.colPaid}>PAID ON SPOT</Text>
            <Text style={a4Styles.colStatus}>STATUS</Text>
          </View>

          {dailyEntries.length === 0 ? (
            <View style={[a4Styles.tableRow, { justifyContent: 'center', paddingVertical: 8 }]}>
              <Text style={{ color: '#94A3B8', fontSize: 7.5 }}>
                No deliveries recorded during this period.
              </Text>
            </View>
          ) : (
            dailyEntries.map((row, idx) => {
              const isSettled =
                row.paymentStatus === 'Settled' ||
                row.paymentStatus === 'Covered' ||
                row.paymentStatus === 'Paid at Delivery' ||
                row.paymentStatus === 'Paid on Spot';

              return (
                <View key={idx} style={[a4Styles.tableRow, idx % 2 === 1 ? a4Styles.tableRowAlt : {}]}>
                  <Text style={a4Styles.colDate}>{row.date}</Text>
                  <Text style={a4Styles.colSession}>{row.session}</Text>
                  <Text style={a4Styles.colItems}>{row.itemsDescription}</Text>
                  <Text style={a4Styles.colAmt}>{(row.deliveryAmount / 100).toFixed(2)}</Text>
                  <Text style={[a4Styles.colPaid, { color: row.paidAmount > 0 ? '#16A34A' : '#64748B' }]}>
                    {row.paidAmount > 0 ? (row.paidAmount / 100).toFixed(2) : '—'}
                  </Text>
                  <View style={{ width: '12%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text
                      style={{
                        fontSize: 6.5,
                        fontFamily: 'Helvetica-Bold',
                        color: isSettled ? '#166534' : '#475569',
                      }}
                    >
                      {row.paymentStatus === 'Paid at Delivery' ? 'Paid on Spot' : row.paymentStatus || 'In Bill Due'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* 2. Payments Received in this Period Register (if any) */}
        {paymentsList.length > 0 && (
          <View style={{ marginTop: 2 }}>
            <View style={a4Styles.sectionHeaderRow}>
              <Text style={a4Styles.sectionTitle}>
                2. Payments Received in Period
              </Text>
              <Text style={[a4Styles.sectionSubtitle, { color: '#16A34A', fontFamily: 'Helvetica-Bold' }]}>
                {paymentsList.length} Transactions totaling {(totalPayments / 100).toFixed(2)}
              </Text>
            </View>
            <View style={a4Styles.tableContainer}>
              <View style={a4Styles.tableHeader}>
                <Text style={{ width: '22%' }}>DATE</Text>
                <Text style={{ width: '25%' }}>PAYMENT MODE</Text>
                <Text style={{ width: '33%' }}>REFERENCE / TXN ID</Text>
                <Text style={{ width: '20%', textAlign: 'right' }}>AMOUNT RECEIVED</Text>
              </View>
              {paymentsList.map((p, idx) => (
                <View key={idx} style={[a4Styles.tableRow, idx % 2 === 1 ? a4Styles.tableRowAlt : {}]}>
                  <Text style={{ width: '22%' }}>{p.date}</Text>
                  <Text style={{ width: '25%' }}>{p.paymentMethod}</Text>
                  <Text style={{ width: '33%', color: '#64748B' }}>{p.referenceNo || 'Direct Payment'}</Text>
                  <Text style={{ width: '20%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: '#16A34A' }}>
                    {(p.amount / 100).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3. Bottom Row: Product Summary & Financial Statement Settlement */}
        <View style={a4Styles.summaryGrid}>
          {/* Product Summary Table */}
          <View style={a4Styles.productCard}>
            <View style={a4Styles.sectionHeaderRow}>
              <Text style={a4Styles.sectionTitle}>
                {paymentsList.length > 0 ? '3. Product-Wise Summary' : '2. Product-Wise Summary'}
              </Text>
            </View>
            <View style={a4Styles.tableContainer}>
              <View style={a4Styles.tableHeader}>
                <Text style={{ flex: 3 }}>PRODUCT NAME</Text>
                <Text style={{ flex: 1.5, textAlign: 'right' }}>TOTAL QTY</Text>
                <Text style={{ flex: 1.5, textAlign: 'right' }}>RATE</Text>
                <Text style={{ flex: 2, textAlign: 'right' }}>AMOUNT</Text>
              </View>
              {productSummary.length === 0 ? (
                <View style={[a4Styles.tableRow, { justifyContent: 'center', paddingVertical: 6 }]}>
                  <Text style={{ color: '#94A3B8', fontSize: 7.5 }}>No products recorded.</Text>
                </View>
              ) : (
                productSummary.map((item, idx) => (
                  <View key={idx} style={a4Styles.tableRow}>
                    <Text style={{ flex: 3 }}>{item.productName}</Text>
                    <Text style={{ flex: 1.5, textAlign: 'right' }}>{item.totalQuantity} {item.unit}</Text>
                    <Text style={{ flex: 1.5, textAlign: 'right' }}>{(item.rate / 100).toFixed(2)}</Text>
                    <Text style={{ flex: 2, textAlign: 'right', fontFamily: 'Helvetica-Bold' }}>
                      {(item.totalAmount / 100).toFixed(2)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Financial Settlement Card */}
          <View style={a4Styles.summaryCard}>
            <Text style={[a4Styles.sectionTitle, { marginBottom: 6 }]}>
              {paymentsList.length > 0 ? '4. Statement Settlement' : '3. Statement Settlement'}
            </Text>
            <View style={a4Styles.summaryRow}>
              <Text>Previous Balance (Opening Due):</Text>
              <Text>{formatPaiseForPDF(openingBalance)}</Text>
            </View>
            <View style={a4Styles.summaryRow}>
              <Text>Current Period Deliveries:</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>+{formatPaiseForPDF(totalCharges)}</Text>
            </View>
            <View style={a4Styles.summaryRow}>
              <Text>Total Payments Received:</Text>
              <Text style={{ color: '#16A34A', fontFamily: 'Helvetica-Bold' }}>
                -{formatPaiseForPDF(totalPayments)}
              </Text>
            </View>
            <View style={a4Styles.finalDueRow}>
              <Text>Net Closing Balance Payable:</Text>
              <Text style={{ color: isFullySettled ? '#16A34A' : '#0F172A' }}>
                {isFullySettled ? 'Rs. 0.00 (Settled)' : formatPaiseForPDF(closingBalance)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={a4Styles.footer}>
          {footerNote || 'Thank you for your prompt payments!'}
        </Text>
      </Page>
    </Document>
  );
};
