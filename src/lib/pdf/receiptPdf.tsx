import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatPaiseForPDF } from '../calculations/money';
import { AGENCY_LOGO_BASE64 } from '../logoBase64';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
  },
  // Top Cyan Banner matching user's mobile app slip
  topBanner: {
    backgroundColor: '#00A8E8',
    paddingVertical: 14,
    paddingHorizontal: 16,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Helvetica',
    opacity: 0.95,
    marginBottom: 4,
  },
  bannerAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },

  // Main Container with padding
  body: {
    padding: 16,
  },

  // Agency Header Section
  agencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  agencyDetails: {
    flex: 1,
    paddingRight: 10,
  },
  agencyTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
    textTransform: 'uppercase',
    lineHeight: 1.3,
    marginBottom: 3,
  },
  agencyAddress: {
    fontSize: 7.5,
    color: '#64748B',
    lineHeight: 1.3,
    marginBottom: 2,
  },
  agencyPhone: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#00A8E8',
    marginBottom: 2,
  },
  agencyGst: {
    fontSize: 7.5,
    color: '#64748B',
    lineHeight: 1.2,
  },
  agencyState: {
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 1,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  // Bill To & Ref Row
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  metaLeft: {
    flex: 1,
  },
  metaRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metaCyanLabel: {
    color: '#00A8E8',
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  customerPhone: {
    color: '#00A8E8',
    fontSize: 8,
  },
  refValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
  },

  // Products Table
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: '#334155',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4.5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    fontSize: 8,
  },
  tableRowSubTotal: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1.5,
    borderTopColor: '#CBD5E1',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  colSr: { width: '8%' },
  colName: { width: '44%' },
  colQty: { width: '16%' },
  colPrice: { width: '16%', textAlign: 'right' },
  colAmt: { width: '16%', textAlign: 'right' },

  // Financial Balance Block
  balanceSection: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  balanceBox: {
    width: '60%',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
    fontSize: 8,
    color: '#475569',
  },
  balanceRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    marginTop: 2,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#0F172A',
  },

  // Tax Details Block
  taxSection: {
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
    alignItems: 'flex-end',
  },
  taxTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    marginBottom: 3,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    paddingVertical: 1.5,
    fontSize: 7.5,
    color: '#64748B',
  },

  // Footer Note
  footerText: {
    textAlign: 'center',
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
  },
});

export interface DailyReceiptProps {
  agencyName: string;
  agencyAddress?: string;
  agencyMobile?: string;
  receiptBrandLine?: string;
  receiptGst?: string;
  agencyState?: string;
  logoUrl?: string;
  receiptNo: string;
  date: string;
  customerName: string;
  customerCode: string;
  customerMobile?: string;
  session?: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    lineAmount: number;
  }[];
  todayTotal: number;
  previousBalance: number;
  paymentReceived: number;
  closingBalance: number;
  footerNote?: string;
  headerColor?: string;
}

export const DailyReceiptDocument: React.FC<DailyReceiptProps> = ({
  agencyName,
  agencyAddress,
  agencyMobile,
  receiptBrandLine,
  receiptGst,
  agencyState = 'Maharashtra',
  logoUrl,
  receiptNo,
  date,
  customerName,
  customerCode,
  customerMobile,
  items,
  todayTotal,
  previousBalance,
  paymentReceived,
  closingBalance,
  footerNote,
  headerColor = '#00A8E8',
}) => {
  const effectiveLogo = logoUrl || AGENCY_LOGO_BASE64;
  const totalQty = items.reduce((sum, it) => sum + it.quantity, 0);
  const pageHeight = Math.max(500, 360 + items.length * 22);

  // Clean title so brand line is never duplicated
  const displayAgencyTitle = receiptBrandLine && !agencyName.toLowerCase().includes(receiptBrandLine.toLowerCase())
    ? `${agencyName} - ${receiptBrandLine}`
    : agencyName;

  return (
    <Document>
      <Page size={[300, pageHeight]} style={styles.page}>
        {/* Top Header Banner - Amount Due */}
        <View style={[styles.topBanner, { backgroundColor: headerColor || '#00A8E8' }]}>
          <Text style={styles.bannerLabel}>Amount due</Text>
          <Text style={styles.bannerAmount}>{formatPaiseForPDF(closingBalance)}</Text>
        </View>

        <View style={styles.body}>
          {/* Agency Details & Logo */}
          <View style={styles.agencyRow}>
            <View style={styles.agencyDetails}>
              <Text style={styles.agencyTitle}>{displayAgencyTitle}</Text>
              {agencyAddress && <Text style={styles.agencyAddress}>{agencyAddress}</Text>}
              {agencyMobile && (
                <Text style={[styles.agencyPhone, { color: headerColor || '#00A8E8' }]}>
                  Tel: {agencyMobile}
                </Text>
              )}
              {receiptGst && <Text style={styles.agencyGst}>Company GST : {receiptGst}</Text>}
              <Text style={styles.agencyState}>{agencyState}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image src={effectiveLogo} style={styles.logo} />
            </View>
          </View>

          {/* Bill To & Ref / Date */}
          <View style={styles.metaSection}>
            <View style={styles.metaLeft}>
              <Text style={[styles.metaCyanLabel, { color: headerColor || '#00A8E8' }]}>Bill To:</Text>
              <Text style={styles.customerName}>{customerName}</Text>
              {customerMobile && (
                <Text style={[styles.customerPhone, { color: headerColor || '#00A8E8' }]}>
                  Tel: {customerMobile}
                </Text>
              )}
            </View>
            <View style={styles.metaRight}>
              <Text style={[styles.metaCyanLabel, { color: headerColor || '#00A8E8' }]}>
                Ref No: <Text style={styles.refValue}>{receiptNo.replace('RCP-', '')}</Text>
              </Text>
              <Text style={[styles.metaCyanLabel, { color: headerColor || '#00A8E8' }]}>Date of Issue</Text>
              <Text style={styles.dateValue}>{date}</Text>
            </View>
          </View>

          {/* Products Table (Enclosed Rounded Box matching BillingView) */}
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.colSr}>SR</Text>
              <Text style={styles.colName}>NAME</Text>
              <Text style={styles.colQty}>QTY</Text>
              <Text style={styles.colPrice}>PRICE</Text>
              <Text style={styles.colAmt}>AMOUNT</Text>
            </View>

            {/* Table Items */}
            {items.map((it, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colSr}>{idx + 1}</Text>
                <Text style={styles.colName}>{it.name}</Text>
                <Text style={styles.colQty}>{it.quantity}{it.unit}</Text>
                <Text style={styles.colPrice}>{(it.unitPrice / 100).toFixed(2)}</Text>
                <Text style={styles.colAmt}>{(it.lineAmount / 100).toFixed(2)}</Text>
              </View>
            ))}

            {/* Subtotal Row */}
            <View style={styles.tableRowSubTotal}>
              <Text style={styles.colSr}></Text>
              <Text style={styles.colName}>Total</Text>
              <Text style={styles.colQty}>{totalQty}</Text>
              <Text style={styles.colPrice}></Text>
              <Text style={styles.colAmt}>{(todayTotal / 100).toFixed(2)}</Text>
            </View>
          </View>

          {/* Financial Balance Summary */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceBox}>
              <View style={styles.balanceRow}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Total</Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{(todayTotal / 100).toFixed(2)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text>Balance</Text>
                <Text>{(todayTotal / 100).toFixed(2)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text>Previous Bal.</Text>
                <Text>{(previousBalance / 100).toFixed(2)}</Text>
              </View>
              {paymentReceived > 0 && (
                <View style={styles.balanceRow}>
                  <Text>Paid Today</Text>
                  <Text>-{(paymentReceived / 100).toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.balanceRowHighlight}>
                <Text>Current Bal.</Text>
                <Text>{(closingBalance / 100).toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerText}>
            {footerNote || 'Thank you for doing business with us.'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export interface PaymentReceiptPdfProps {
  agencyName: string;
  agencyAddress?: string;
  agencyMobile?: string;
  receiptBrandLine?: string;
  receiptGst?: string;
  agencyState?: string;
  logoUrl?: string;
  receiptNo: string;
  paymentDate: string;
  customerName: string;
  customerCode: string;
  customerMobile?: string;
  paymentAmount: number; // in paise
  paymentMethod: string;
  referenceNo?: string;
  previousBalance: number; // in paise
  closingBalance: number; // in paise
  notes?: string;
  footerNote?: string;
  headerColor?: string;
}

export const PaymentReceiptDocument: React.FC<PaymentReceiptPdfProps> = ({
  agencyName,
  agencyAddress,
  agencyMobile,
  receiptBrandLine,
  receiptGst,
  agencyState = 'Maharashtra',
  logoUrl,
  receiptNo,
  paymentDate,
  customerName,
  customerCode,
  customerMobile,
  paymentAmount,
  paymentMethod,
  referenceNo,
  previousBalance,
  closingBalance,
  notes,
  footerNote,
  headerColor = '#00A8E8', // Cyan default matching Delivery Slip
}) => {
  const effectiveLogo = logoUrl || AGENCY_LOGO_BASE64;

  const displayAgencyTitle =
    receiptBrandLine && !agencyName.toLowerCase().includes(receiptBrandLine.toLowerCase())
      ? `${agencyName} - ${receiptBrandLine}`
      : agencyName;

  const methodLabel =
    paymentMethod === 'cash'
      ? 'Cash'
      : paymentMethod === 'upi'
      ? 'UPI'
      : paymentMethod === 'bank_transfer'
      ? 'Bank'
      : paymentMethod.toUpperCase();

  const particularText = notes || 'Payment Received';
  const curBalLabel = closingBalance > 0 ? 'Current Bal.' : closingBalance < 0 ? 'Advance Bal.' : 'Current Bal.';

  return (
    <Document>
      <Page size={[300, 490]} style={styles.page}>
        {/* Top Header Banner - Payment Received */}
        <View style={[styles.topBanner, { backgroundColor: headerColor }]}>
          <Text style={styles.bannerLabel}>Payment received</Text>
          <Text style={styles.bannerAmount}>Rs. {(paymentAmount / 100).toFixed(2)}</Text>
        </View>

        <View style={styles.body}>
          {/* Agency Details & Logo */}
          <View style={styles.agencyRow}>
            <View style={styles.agencyDetails}>
              <Text style={styles.agencyTitle}>{displayAgencyTitle}</Text>
              {agencyAddress && <Text style={styles.agencyAddress}>{agencyAddress}</Text>}
              {agencyMobile && (
                <Text style={[styles.agencyPhone, { color: headerColor }]}>
                  Tel: {agencyMobile}
                </Text>
              )}
              {receiptGst && <Text style={styles.agencyGst}>Company GST : {receiptGst}</Text>}
              <Text style={styles.agencyState}>{agencyState}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image src={effectiveLogo} style={styles.logo} />
            </View>
          </View>

          {/* Bill To & Ref / Date */}
          <View style={styles.metaSection}>
            <View style={styles.metaLeft}>
              <Text style={[styles.metaCyanLabel, { color: headerColor }]}>Bill To:</Text>
              <Text style={styles.customerName}>{customerName}</Text>
              {customerMobile && (
                <Text style={[styles.customerPhone, { color: headerColor }]}>
                  Tel: {customerMobile}
                </Text>
              )}
            </View>
            <View style={styles.metaRight}>
              <Text style={[styles.metaCyanLabel, { color: headerColor }]}>
                Ref No: <Text style={styles.refValue}>{receiptNo.replace('RCP-PAY-', '').replace('RCP-', '')}</Text>
              </Text>
              <Text style={[styles.metaCyanLabel, { color: headerColor }]}>Date of Payment</Text>
              <Text style={styles.dateValue}>{paymentDate}</Text>
            </View>
          </View>

          {/* Table Container (Enclosed Rounded Box matching DailyReceiptDocument) */}
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={{ width: '10%', textAlign: 'center' }}>SR</Text>
              <Text style={{ width: '42%' }}>PARTICULARS</Text>
              <Text style={{ width: '18%', textAlign: 'center' }}>MODE</Text>
              <Text style={{ width: '14%', textAlign: 'center' }}>REF NO</Text>
              <Text style={{ width: '16%', textAlign: 'right' }}>AMOUNT</Text>
            </View>

            {/* Item Row */}
            <View style={styles.tableRow}>
              <Text style={{ width: '10%', textAlign: 'center', color: '#64748B' }}>1</Text>
              <Text style={{ width: '42%', fontFamily: 'Helvetica-Bold' }}>{particularText}</Text>
              <Text style={{ width: '18%', textAlign: 'center' }}>{methodLabel}</Text>
              <Text style={{ width: '14%', textAlign: 'center', color: '#64748B' }}>{referenceNo || '—'}</Text>
              <Text style={{ width: '16%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }}>
                {(paymentAmount / 100).toFixed(2)}
              </Text>
            </View>

            {/* Subtotal Row */}
            <View style={styles.tableRowSubTotal}>
              <Text style={{ width: '10%' }}></Text>
              <Text style={{ width: '42%' }}>Total</Text>
              <Text style={{ width: '18%' }}></Text>
              <Text style={{ width: '14%' }}></Text>
              <Text style={{ width: '16%', textAlign: 'right' }}>{(paymentAmount / 100).toFixed(2)}</Text>
            </View>
          </View>

          {/* Financial Balance Summary Breakdown */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceBox}>
              <View style={styles.balanceRow}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Total</Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{(paymentAmount / 100).toFixed(2)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text>Previous Bal.</Text>
                <Text>{(previousBalance / 100).toFixed(2)}</Text>
              </View>
              <View style={[styles.balanceRow, { color: '#16A34A' }]}>
                <Text>Paid Amount</Text>
                <Text>-{(paymentAmount / 100).toFixed(2)}</Text>
              </View>
              <View style={styles.balanceRowHighlight}>
                <Text>{curBalLabel}</Text>
                <Text>{(Math.abs(closingBalance) / 100).toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerText}>
            {footerNote || 'Thank you for doing business with us.'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
