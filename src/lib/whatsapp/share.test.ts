import { describe, expect, it } from 'vitest';
import { formatInvoiceWhatsAppMessage, formatPaymentWhatsAppMessage } from './share';

describe('formatInvoiceWhatsAppMessage', () => {
  it('formats exact customer invoice message matching user template', () => {
    const text = formatInvoiceWhatsAppMessage({
      customerName: 'Aniket korade',
      agencyName: 'VINAYSHIL KRUSHI FARMERS PRODUCER COMPANY LTD.',
      agencyPhone: '9766691327',
      amountPaise: 3605531,
    });

    const expected = [
      'Hi Aniket korade,',
      'Details of your Sale Invoice from VINAYSHIL KRUSHI FARMERS PRODUCER COMPANY LTD.',
      'Invoice Amount: 36,055.31',
      'Thank you for doing business with us,',
      'VINAYSHIL KRUSHI FARMERS PRODUCER COMPANY LTD.',
      '9766691327',
    ].join('\n');

    expect(text).toBe(expected);
  });

  it('handles default agency name and brand line cleanly', () => {
    const text = formatInvoiceWhatsAppMessage({
      customerName: 'Ajit Gunjal',
      agencyName: 'VINAYSHIL KRUSHI',
      agencyBrandLine: 'FARMERS PRODUCER COMPANY LTD.',
      agencyPhone: '9766691327',
      amountPaise: 109000,
    });

    expect(text).toContain('Hi Ajit Gunjal,');
    expect(text).toContain('Details of your Sale Invoice from VINAYSHIL KRUSHI FARMERS PRODUCER COMPANY LTD.');
    expect(text).toContain('Invoice Amount: 1,090.00');
    expect(text).toContain('9766691327');
  });
});

describe('formatPaymentWhatsAppMessage', () => {
  it('formats payment receipt message with accurate calculation: previous balance, deduction, and remaining due', () => {
    const text = formatPaymentWhatsAppMessage({
      customerName: 'Santosh Pawar',
      agencyName: 'Satvik Milk Agency',
      agencyPhone: '8600732906',
      paymentAmountPaise: 100000, // ₹1,000.00
      paymentMethod: 'upi',
      paymentDate: '15-Nov-2026',
      receiptNo: 'RCP-PAY-20261115-CUST101',
      referenceNo: 'UPI-987654321',
      previousBalancePaise: 150000, // ₹1,500.00
      closingBalancePaise: 50000, // ₹500.00
    });

    expect(text).toContain('Hi Santosh Pawar,');
    expect(text).toContain('Payment Receipt from Satvik Milk Agency.');
    expect(text).toContain('We have received payment of ₹1,000.00 via UPI / QR Code.');
    expect(text).toContain('• Receipt No: RCP-PAY-20261115-CUST101');
    expect(text).toContain('• Ref / UTR No: UPI-987654321');
    expect(text).toContain('• Previous Balance: ₹1,500.00');
    expect(text).toContain('• Amount Deducted: -₹1,000.00');
    expect(text).toContain('• *Remaining Balance Due: ₹500.00*');
    expect(text).toContain('8600732906');
  });

  it('formats settled message when entire bill is paid in full', () => {
    const text = formatPaymentWhatsAppMessage({
      customerName: 'Rahul Korade',
      paymentAmountPaise: 60000, // ₹600.00
      paymentMethod: 'cash',
      paymentDate: '15-Nov-2026',
      receiptNo: 'RCP-PAY-20261115-CUST102',
      previousBalancePaise: 60000, // ₹600.00
      closingBalancePaise: 0,
    });

    expect(text).toContain('Hi Rahul Korade,');
    expect(text).toContain('• Previous Balance: ₹600.00');
    expect(text).toContain('• Amount Deducted: -₹600.00');
    expect(text).toContain('• *Remaining Balance: ₹0.00 (All Dues Cleared)*');
  });

  it('formats advance balance message when payment exceeds due amount', () => {
    const text = formatPaymentWhatsAppMessage({
      customerName: 'Ganesh Shinde',
      paymentAmountPaise: 100000, // ₹1,000.00
      paymentMethod: 'bank_transfer',
      paymentDate: '15-Nov-2026',
      receiptNo: 'RCP-PAY-20261115-CUST103',
      previousBalancePaise: 40000, // ₹400.00
      closingBalancePaise: -60000, // -₹600.00 advance
    });

    expect(text).toContain('• Previous Balance: ₹400.00');
    expect(text).toContain('• Amount Deducted: -₹1,000.00');
    expect(text).toContain('• *Advance Balance Available: ₹600.00*');
  });
});
