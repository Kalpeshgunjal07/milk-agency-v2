import { describe, expect, it } from 'vitest';
import { formatInvoiceWhatsAppMessage } from './share';

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
