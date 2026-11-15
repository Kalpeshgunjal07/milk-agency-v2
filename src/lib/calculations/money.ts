/**
 * Financial calculation rules & monetary integrity module.
 * Everything in paise (1 INR = 100 paise) to prevent floating-point drift.
 */

export function parseRupeesToPaise(value: string | number): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 0;
    return Math.round(value * 100);
  }
  const normalized = value.trim().replace(/,/g, '');
  if (!normalized) return 0;
  
  const match = /^(-)?(?:0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) {
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100);
  }

  const isNegative = !!match[1];
  const wholeRupees = parseInt(match[0].replace('-', ''), 10);
  const fractionalPaise = parseInt((match[2] ?? '').padEnd(2, '0').slice(0, 2), 10);
  const total = wholeRupees * 100 + fractionalPaise;

  return isNegative ? -total : total;
}

export function paiseToRupees(paise: number): number {
  return (paise || 0) / 100;
}

export function formatPaiseAsINR(paise: number): string {
  const safePaise = Number.isFinite(paise) ? paise : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(safePaise / 100);
}

/**
 * Format currency specifically for PDF engines (e.g. @react-pdf/renderer).
 * Standard PDF Helvetica fonts lack the Unicode Indian Rupee symbol (₹ / \u20B9),
 * causing it to render as a glitched or superscript "1" (¹).
 * Using "Rs. " ensures 100% clean, crisp ASCII rendering across all PDF readers and POS printers.
 */
export function formatPaiseForPDF(paise: number): string {
  const safePaise = Number.isFinite(paise) ? paise : 0;
  const isNegative = safePaise < 0;
  const rupees = Math.abs(safePaise / 100);
  const formatted = rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}Rs. ${formatted}`;
}

export function formatQuantityWithUnit(quantity: number, unit: string): string {
  const safeQty = Number.isFinite(quantity) ? quantity : 0;
  // Format up to 2 decimal places, trimming trailing zeros
  const formatted = parseFloat(safeQty.toFixed(2)).toString();
  return `${formatted} ${unit}`;
}

export function calculateLineAmountPaise(quantity: number, unitPricePaise: number): number {
  const safeQty = Math.max(0, quantity || 0);
  const safeRate = Math.max(0, unitPricePaise || 0);
  return Math.round(safeQty * safeRate);
}

export function calculateClosingBalancePaise({
  openingBalancePaise,
  chargesPaise,
  paymentsPaise,
  creditsPaise = 0,
}: {
  openingBalancePaise: number;
  chargesPaise: number;
  paymentsPaise: number;
  creditsPaise?: number;
}): number {
  return (openingBalancePaise || 0) + (chargesPaise || 0) - (paymentsPaise || 0) - (creditsPaise || 0);
}
