import { describe, expect, it } from 'vitest';
import {
  calculateClosingBalancePaise,
  formatPaiseAsINR,
  formatPaiseForPDF,
  parseRupeesToPaise,
  calculateLineAmountPaise,
} from './money';

describe('parseRupeesToPaise', () => {
  it('converts valid rupee strings to integer paise', () => {
    expect(parseRupeesToPaise('0')).toBe(0);
    expect(parseRupeesToPaise('12')).toBe(1200);
    expect(parseRupeesToPaise('12.3')).toBe(1230);
    expect(parseRupeesToPaise('12.34')).toBe(1234);
    expect(parseRupeesToPaise('60.50')).toBe(6050);
  });

  it('converts numbers directly to paise', () => {
    expect(parseRupeesToPaise(60.5)).toBe(6050);
    expect(parseRupeesToPaise(100)).toBe(10000);
  });
});

describe('calculateClosingBalancePaise', () => {
  it('applies opening balance, charges, and payments as integers', () => {
    expect(
      calculateClosingBalancePaise({
        openingBalancePaise: 10000,
        chargesPaise: 2750,
        paymentsPaise: 5000,
        creditsPaise: 250,
      })
    ).toBe(7500);
  });

  it('handles zero and advance payments (credit balance)', () => {
    expect(
      calculateClosingBalancePaise({
        openingBalancePaise: 0,
        chargesPaise: 12000,
        paymentsPaise: 15000,
      })
    ).toBe(-3000);
  });
});

describe('calculateLineAmountPaise', () => {
  it('multiplies quantity with unit rate correctly', () => {
    // 2 Litres @ ₹60.00 = ₹120.00
    expect(calculateLineAmountPaise(2, 6000)).toBe(12000);
    // 1.5 Litres @ ₹75.00 = ₹112.50
    expect(calculateLineAmountPaise(1.5, 7500)).toBe(11250);
    // 0.25 Kg @ ₹380.00 = ₹95.00
    expect(calculateLineAmountPaise(0.25, 38000)).toBe(9500);
  });
});

describe('formatPaiseAsINR', () => {
  it('formats paise as Indian rupees currency format', () => {
    const formatted = formatPaiseAsINR(123456);
    expect(formatted).toContain('1,234.56');
  });
});

describe('formatPaiseForPDF', () => {
  it('formats paise cleanly for PDF engines with Rs. prefix without unicode glitch', () => {
    expect(formatPaiseForPDF(109000)).toBe('Rs. 1,090.00');
    expect(formatPaiseForPDF(0)).toBe('Rs. 0.00');
    expect(formatPaiseForPDF(6000)).toBe('Rs. 60.00');
    expect(formatPaiseForPDF(-50000)).toBe('-Rs. 500.00');
  });
});
