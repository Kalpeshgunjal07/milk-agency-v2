/**
 * HTML5 Canvas Digital Receipt Image Generator.
 * Generates ultra-high-DPI, cut-to-cut vertical PNG image slips with the
 * EXACT same clean, modern card design as the on-screen delivery slip (BillingView):
 * - Cut-to-cut image canvas (ZERO outer gray margins / ZERO surrounding padding)
 * - Ultra-high resolution (3x Retina scale: 1,260px wide, 300+ DPI crisp text)
 * - Full Google Poppins typography with font-ready preloading
 * - Top customizable color banner ("Amount due" & "Rs. XXX.XX") flush to top/sides
 * - Wrapped agency title & details that NEVER overlap the circular logo
 * - Synchronized Bill-To & Ref-No section with zero label collision
 * - Enclosed rounded products table with slate-200 header (#E2E8F0)
 * - Right-aligned financial balance summary box
 * - Tight, compact dynamic height (NO dead empty whitespace at bottom)
 * 100% offline, lightning-fast, and compatible with WhatsApp image sharing.
 */

import { formatPaiseForPDF } from './calculations/money';
import { AGENCY_LOGO_BASE64 } from './logoBase64';

export interface ReceiptImageItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number; // in paise
  lineAmount: number; // in paise
}

export interface ReceiptImageOptions {
  agencyName: string;
  agencyAddress?: string;
  agencyMobile?: string;
  receiptBrandLine?: string;
  receiptGst?: string;
  agencyState?: string;
  receiptNo: string;
  date: string;
  customerName: string;
  customerCode?: string;
  customerMobile?: string;
  items: ReceiptImageItem[];
  todayTotal: number; // in paise
  previousBalance: number; // in paise
  paymentReceived: number; // in paise
  closingBalance: number; // in paise
  footerNote?: string;
  headerColor?: string; // Hex, e.g. '#00A8E8'
  logoBase64?: string;
}

function loadCanvasImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawTopRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export async function generateReceiptImageBlob(options: ReceiptImageOptions): Promise<Blob> {
  // Ensure Google Fonts (Poppins) are loaded and ready before rendering canvas
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if font loading promise fails
    }
  }

  // 1. DIMENSIONS: Cut-to-Cut Card Canvas (NO OUTER PADDING / MARGINS)
  // Logical width matches the on-screen card (420px).
  // Scale factor of 3 gives 1,260px physical width (300+ DPI Retina crisp text).
  const width = 420;
  const padX = 20;
  const rightX = width - padX;
  const contentW = rightX - padX; // 380px
  const headerColor = options.headerColor || '#00A8E8';
  const effectiveLogo = options.logoBase64 || AGENCY_LOGO_BASE64;

  const fontSans = 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Load agency logo
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadCanvasImage(effectiveLogo);
  } catch (err) {
    console.warn('Receipt logo could not be loaded for canvas:', err);
  }

  // Temporary canvas to measure exact text dimensions
  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d');
  if (!mCtx) throw new Error('Canvas 2D context not available');

  // 2. PRE-MEASURE CONTENT FOR CUT-TO-CUT DYNAMIC HEIGHT
  const logoSize = 64;
  const logoX = rightX - logoSize;
  const maxTextW = logoX - padX - 12;

  // Clean Agency Title (never duplicate brand line if already in agency name)
  const cleanTitle = options.receiptBrandLine && !options.agencyName.toLowerCase().includes(options.receiptBrandLine.toLowerCase())
    ? `${options.agencyName} ${options.receiptBrandLine}`.trim()
    : options.agencyName.trim();

  // Word-wrap title and address so they NEVER collide with the circular logo
  mCtx.font = 'bold 12.5px ' + fontSans;
  const titleLines = wrapText(mCtx, cleanTitle.toUpperCase(), maxTextW);

  mCtx.font = 'normal 10px ' + fontSans;
  const addressLines = options.agencyAddress ? wrapText(mCtx, options.agencyAddress, maxTextW) : [];

  let agencyBlockH = titleLines.length * 17 + 4;
  agencyBlockH += addressLines.length * 15;
  if (options.agencyMobile) agencyBlockH += 17;
  if (options.receiptGst) agencyBlockH += 15;
  agencyBlockH += 15; // State
  const agencySectionHeight = Math.max(agencyBlockH, logoSize) + 14;

  const bannerHeight = 88;
  const metaHeight = 10 + 17 + 17 + 17 + 12; // top divider + 3 rows + bottom divider
  const tableHeaderHeight = 25;
  const tableRowHeight = 25;
  const itemsCount = Math.max(1, options.items.length);
  const tableBodyHeight = itemsCount * tableRowHeight;
  const tableSubtotalHeight = 27;
  const tableTotalH = tableHeaderHeight + tableBodyHeight + tableSubtotalHeight;

  const balanceRowCount = 4 + (options.paymentReceived > 0 ? 1 : 0);
  const balanceHeight = 10 + balanceRowCount * 18 + 8;
  const footerHeight = 12 + 16 + 18; // divider + text + bottom padding

  const totalHeight = Math.round(
    bannerHeight + 18 + agencySectionHeight + metaHeight + 14 + tableTotalH + balanceHeight + footerHeight
  );

  // 3. CREATE ULTRA HIGH-DPI CANVAS (3x Retina Scale for Razor-Sharp Text)
  const scale = 3;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(totalHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 4. CUT-TO-CUT CARD BACKGROUND (Pure white, zero surrounding gray padding)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, totalHeight);

  // 5. TOP CUSTOMIZABLE COLOR BANNER (Flush to top, left, and right edges)
  ctx.fillStyle = headerColor;
  ctx.fillRect(0, 0, width, bannerHeight);

  // Label: "Amount due"
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '500 13px ' + fontSans;
  ctx.textAlign = 'center';
  ctx.fillText('Amount due', width / 2, 34);

  // Value: "Rs. 360.00"
  const amountStr = formatPaiseForPDF(options.closingBalance);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px ' + fontSans;
  ctx.fillText(amountStr, width / 2, 70);

  let currentY = bannerHeight + 18;

  // 6. AGENCY HEADER SECTION & CIRCULAR LOGO
  const logoY = currentY;

  // Draw Circular Logo Badge on Right
  ctx.save();
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 - 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logoImg, logoX + 2, logoY + 2, logoSize - 4, logoSize - 4);
    ctx.restore();
  }
  ctx.restore();

  // Agency Info on Left (Word-wrapped cleanly before logoX)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 12.5px ' + fontSans;
  for (const line of titleLines) {
    ctx.fillText(line, padX, currentY + 12);
    currentY += 17;
  }
  currentY += 3;

  ctx.fillStyle = '#64748B';
  ctx.font = 'normal 10px ' + fontSans;
  for (const line of addressLines) {
    ctx.fillText(line, padX, currentY + 10);
    currentY += 15;
  }

  if (options.agencyMobile) {
    ctx.fillStyle = headerColor;
    ctx.font = 'bold 11px ' + fontSans;
    ctx.fillText(`📞 ${options.agencyMobile}`, padX, currentY + 11);
    currentY += 17;
  }

  if (options.receiptGst) {
    ctx.fillStyle = '#64748B';
    ctx.font = 'normal 10px ' + fontSans;
    ctx.fillText(`Company GST : ${options.receiptGst}`, padX, currentY + 10);
    currentY += 15;
  }

  ctx.fillStyle = '#64748B';
  ctx.font = 'normal 10px ' + fontSans;
  ctx.fillText(options.agencyState || 'Maharashtra', padX, currentY + 10);
  currentY += 15;

  // Clear logo vertical height
  currentY = Math.max(currentY, logoY + logoSize) + 14;

  // 7. BILL TO & REF SECTION (Exact layout as BillingView on-screen slip)
  // Top divider
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, currentY);
  ctx.lineTo(rightX, currentY);
  ctx.stroke();

  currentY += 10;

  // Row 1: Bill To (Left) & Ref No (Right)
  ctx.textAlign = 'left';
  ctx.fillStyle = headerColor;
  ctx.font = 'bold 10px ' + fontSans;
  ctx.fillText('Bill To:', padX, currentY + 10);

  const refNumStr = options.receiptNo.replace('RCP-', '');
  ctx.font = 'bold 11.5px ' + fontSans;
  const refNumWidth = ctx.measureText(refNumStr).width;
  ctx.font = 'bold 10.5px ' + fontSans;
  const refLabelWidth = ctx.measureText('Ref No: ').width;
  const refStartX = rightX - refNumWidth - refLabelWidth;

  ctx.fillStyle = headerColor;
  ctx.fillText('Ref No: ', refStartX, currentY + 10);
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 11.5px ' + fontSans;
  ctx.fillText(refNumStr, refStartX + refLabelWidth, currentY + 10);

  // Row 2: Customer Name (Left) & Date of Issue (Right)
  currentY += 17;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 13px ' + fontSans;
  ctx.fillText(options.customerName, padX, currentY + 11);

  ctx.textAlign = 'right';
  ctx.fillStyle = headerColor;
  ctx.font = 'bold 10px ' + fontSans;
  ctx.fillText('Date of Issue', rightX, currentY + 10);

  // Row 3: Customer Phone (Left) & Date Value (Right)
  currentY += 17;
  if (options.customerMobile) {
    ctx.textAlign = 'left';
    ctx.fillStyle = headerColor;
    ctx.font = 'normal 10.5px ' + fontSans;
    ctx.fillText(`📞 ${options.customerMobile}`, padX, currentY + 11);
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 12.5px ' + fontSans;
  ctx.fillText(options.date, rightX, currentY + 11);

  currentY += 15;

  // Bottom divider
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, currentY);
  ctx.lineTo(rightX, currentY);
  ctx.stroke();

  currentY += 14;

  // 8. PRODUCTS TABLE (Enclosed Rounded Box matching BillingView on-screen card)
  const tableX = padX;
  const tableW = contentW;
  const tableRadius = 8;

  const srW = 34; // 34px
  const nameW = 162; // 162px
  const qtyW = 62; // 62px
  const priceW = 60; // 60px
  const amtW = tableW - srW - nameW - qtyW - priceW; // 62px

  // Draw Table Container Outline
  drawRoundedRectPath(ctx, tableX, currentY, tableW, tableTotalH, tableRadius);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Table Header Background (Soft Slate-200 #E2E8F0)
  ctx.save();
  ctx.beginPath();
  drawTopRoundedRectPath(ctx, tableX, currentY, tableW, tableHeaderHeight, tableRadius);
  ctx.clip();
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(tableX, currentY, tableW, tableHeaderHeight);

  // Header Titles (Uppercase, slate-700 #334155)
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 9.5px ' + fontSans;

  ctx.textAlign = 'center';
  ctx.fillText('SR', tableX + srW / 2, currentY + 16);

  ctx.textAlign = 'left';
  ctx.fillText('NAME', tableX + srW + 6, currentY + 16);

  ctx.textAlign = 'center';
  ctx.fillText('QTY', tableX + srW + nameW + qtyW / 2, currentY + 16);

  ctx.textAlign = 'right';
  ctx.fillText('PRICE', tableX + srW + nameW + qtyW + priceW - 6, currentY + 16);
  ctx.fillText('AMOUNT', tableX + tableW - 6, currentY + 16);
  ctx.restore();

  currentY += tableHeaderHeight;

  // Table Item Rows
  let totalQty = 0;
  options.items.forEach((it, idx) => {
    totalQty += it.quantity;

    ctx.fillStyle = '#64748B';
    ctx.font = 'normal 10px ' + fontSans;
    ctx.textAlign = 'center';
    ctx.fillText(String(idx + 1), tableX + srW / 2, currentY + 16);

    ctx.fillStyle = '#1E293B';
    ctx.font = '500 11px ' + fontSans;
    ctx.textAlign = 'left';
    ctx.fillText(it.name, tableX + srW + 6, currentY + 16);

    ctx.fillStyle = '#334155';
    ctx.font = '500 11px ' + fontSans;
    ctx.textAlign = 'center';
    ctx.fillText(`${it.quantity}${it.unit}`, tableX + srW + nameW + qtyW / 2, currentY + 16);

    ctx.fillStyle = '#475569';
    ctx.font = 'normal 11px ' + fontSans;
    ctx.textAlign = 'right';
    ctx.fillText((it.unitPrice / 100).toFixed(2), tableX + srW + nameW + qtyW + priceW - 6, currentY + 16);

    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 11px ' + fontSans;
    ctx.fillText((it.lineAmount / 100).toFixed(2), tableX + tableW - 6, currentY + 16);

    // Row Bottom Border
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tableX, currentY + tableRowHeight);
    ctx.lineTo(tableX + tableW, currentY + tableRowHeight);
    ctx.stroke();

    currentY += tableRowHeight;
  });

  // Table Subtotal Footer Row (#F8FAFC)
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(tableX, currentY, tableW, tableSubtotalHeight);

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tableX, currentY);
  ctx.lineTo(tableX + tableW, currentY);
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 11px ' + fontSans;
  ctx.textAlign = 'left';
  ctx.fillText('Total', tableX + srW + 6, currentY + 17);

  ctx.textAlign = 'center';
  ctx.fillText(`${totalQty}`, tableX + srW + nameW + qtyW / 2, currentY + 17);

  ctx.textAlign = 'right';
  ctx.font = 'bold 11.5px ' + fontSans;
  ctx.fillText((options.todayTotal / 100).toFixed(2), tableX + tableW - 6, currentY + 17);

  currentY += tableSubtotalHeight + 12;

  // 9. FINANCIAL BALANCE SUMMARY (Right-Aligned Box)
  const boxW = 210;
  const boxX = rightX - boxW;

  const renderBalanceRow = (label: string, valStr: string, isBold = false, valColor = '#1E293B') => {
    ctx.textAlign = 'left';
    ctx.fillStyle = isBold ? '#1E293B' : '#475569';
    ctx.font = isBold ? 'bold 11px ' + fontSans : '500 11px ' + fontSans;
    ctx.fillText(label, boxX, currentY + 12);

    ctx.textAlign = 'right';
    ctx.fillStyle = valColor;
    ctx.font = isBold ? 'bold 11.5px ' + fontSans : 'normal 11px ' + fontSans;
    ctx.fillText(valStr, rightX, currentY + 12);

    currentY += 18;
  };

  renderBalanceRow('Total', (options.todayTotal / 100).toFixed(2), true);
  renderBalanceRow('Balance', (options.todayTotal / 100).toFixed(2));
  renderBalanceRow('Previous Bal.', (options.previousBalance / 100).toFixed(2));

  if (options.paymentReceived > 0) {
    renderBalanceRow('Paid Today', `-${(options.paymentReceived / 100).toFixed(2)}`, false, '#16A34A');
  }

  // Current Balance Highlight Row
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(boxX, currentY + 4);
  ctx.lineTo(rightX, currentY + 4);
  ctx.stroke();

  currentY += 8;
  renderBalanceRow('Current Bal.', (options.closingBalance / 100).toFixed(2), true, '#0F172A');

  // 10. FOOTER NOTE (Tight padding, cut-to-cut bottom)
  currentY += 14;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'normal 10.5px ' + fontSans;
  ctx.fillText(options.footerNote || 'Thank you for doing business with us.', width / 2, currentY + 10);

  // Subtle Outer Card Border (1px slate-200 around cut-to-cut canvas)
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, totalHeight);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image blob from canvas'));
      }
    }, 'image/png');
  });
}
