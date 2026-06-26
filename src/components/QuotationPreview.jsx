import React, { forwardRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import PartnerBrands from './PartnerBrands';
import { calculateSubTotal } from '../utils/calculations';

/* ─────────────────────────────────────────────────────────────
   Inject @media print styles once so colors & layout survive
   PDF / print regardless of browser or react-to-print version
───────────────────────────────────────────────────────────── */
const PRINT_CSS = `
  /*
    HYBRID STRATEGY — pinned footer on short quotations,
    natural multi-page flow on long ones.

    The container uses min-height (not a hard height + overflow:
    hidden). On a SHORT quotation, the flex column is exactly one
    page's content height, and margin-top: auto on the partner-
    brands/footer block consumes the leftover space, pinning the
    footer to the bottom edge — like a real letterhead.

    On a LONG quotation (many product rows), the flex column's
    natural content height exceeds one page. margin-top: auto has
    no leftover space to consume in that case, so it collapses to
    0 and the footer simply follows the last row in normal flow.
    The browser's own pagination then inserts as many additional
    pages as needed — nothing is clipped, and the table header
    repeats on each new page (thead { display: table-header-group }).

    This replaces an earlier version that used a hard height +
    overflow: hidden to guarantee the pinned-footer look. That
    approach silently clipped any rows (and the footer) once
    content exceeded one page — which is what happened once real
    quotations grew past ~28 line items. Multi-page correctness
    has to take priority over the pinned-bottom look once a
    document can plausibly run long.
  */
  @media screen {
    .print-container {
      min-height: 297mm;
    }
  }

  @media print {
    @page {
      size: A4;
      margin: 8mm;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      font-size: 10px !important;
    }

    /* Hide everything outside the print container */
    body > *:not(#quotation-print-root) {
      display: none !important;
    }

    .no-print {
      display: none !important;
    }

    .print-container {
      width: 100% !important;
      max-width: 100% !important;
      /* One page's content area (297mm page minus 8mm top + 8mm
         bottom @page margin = 281mm) as a MINIMUM, not a cap.
         Short content stretches to fill it (so the footer can be
         pinned via margin-top:auto below); long content simply
         grows taller and flows onto additional pages normally. */
      min-height: 281mm !important;
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      font-size: 10px !important;
    }

    /* Reduce body content padding */
    #quotation-print-root > div:nth-child(2) {
      padding: 8px 10px !important;
    }

    /* Force background colors to print */
    [data-print-bg] {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Table page breaks — thead repeating on every page is what
       makes long, multi-page tables still readable on page 2+. */
    table { page-break-inside: auto; font-size: 9px !important; }
    tr    { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }

    /* Pin partner-brands + footer to the bottom ONLY when there's
       leftover space (i.e. short quotations). On long quotations
       this margin collapses to 0 automatically — no JS detection
       needed, it's just how flex auto-margins behave. */
    #quotation-print-root > div:nth-last-child(2) {
      margin-top: auto !important;
    }

    #quotation-print-root > div:last-child {
      page-break-inside: avoid;
    }

    /* Ensure images print properly.
       SCOPED to exclude the header (div:first-child) — this rule
       was written for the small partner-brand logos in the footer
       area, but a bare "img" selector with !important also caught
       Header.jsx's headerImg (h-32, ~128px) and header2Img (h-14,
       ~56px), crushing both down to 40px in print. The :not()
       below excludes any <img> inside the header block so it can
       keep its own intended size (set explicitly further down). */
    #quotation-print-root > div:not(:first-child) img {
      max-height: 40px !important;
      width: auto !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Header images keep their on-screen proportions in print
       instead of inheriting the page's default img sizing. These
       mirror Header.jsx's Tailwind classes (h-32 / h-14) so print
       output matches what's shown on screen. Adjust here if the
       Tailwind classes in Header.jsx ever change. */
    #quotation-print-root > div:first-child img {
      width: auto !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    #quotation-print-root > div:first-child img[alt="Abdullah Traders Solar"] {
      max-height: 90px !important;
    }

    #quotation-print-root > div:first-child img[alt="Abdullah Traders Logo"] {
      max-height: 42px !important;
    }

    /* Previously this also forced the HEADER (div:first-child) to
       9px, which crushed the company name/contact info down to an
       unreadable size in print. The header should keep its own
       internal type hierarchy (Header.jsx controls that) — only
       the footer gets a slight size reduction here since it's
       just fine print / contact details. */
    #quotation-print-root > div:last-child {
      font-size: 9px !important;
    }
  }
`;

if (typeof document !== 'undefined') {
  const id = 'quotation-preview-print-css';
  const existing = document.getElementById(id);
  if (existing) {
    // Replace in place in case this module re-runs with updated CSS
    existing.innerHTML = PRINT_CSS;
  } else {
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = PRINT_CSS;
    document.head.appendChild(style);
  }
}

/* ─────────────────────────────────────────────────────────────
   Helper: inline style shorthand for print-safe backgrounds
   Pass the hex color; the data-print-bg attr triggers the CSS
───────────────────────────────────────────────────────────── */
const bg = (color) => ({
  backgroundColor: color,
  'data-print-bg': true,
});

/* ═══════════════════════════════════════════════════════════ */

const QuotationPreview = forwardRef(({ formData }, ref) => {
  const subTotal     = calculateSubTotal(formData.products);
  const discount     = parseFloat(formData.discount)  || 0;
  const taxRate      = parseFloat(formData.taxRate)   || 0;
  const afterDiscount = subTotal - discount;
  const tax          = (afterDiscount * taxRate) / 100;
  const grandTotal   = Math.max(0, afterDiscount + tax);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const formatPKR = (amount) =>
    Number(amount).toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const infoRows = [
    ['Quotation Date', formatDate(formData.date)],
    formData.validUntil ? ['Valid Till', formatDate(formData.validUntil)] : null,
  ].filter(Boolean);

  /* ── styles ─────────────────────────────────────── */
  const BLUE   = '#0F4C81';
  const GREEN  = '#1FA971';
  const DARK   = '#0f172a';
  const MID    = '#334155';
  const MUTED  = '#475569';
  const BORDER = '#e2e8f0';
  const DARK_BORDER = '#0a3860';

  const cell = (extra = {}) => ({
    border: `1px solid ${BORDER}`,
    padding: '7px 8px',
    ...extra,
  });

  const headerCell = (extra = {}) => ({
    padding: '8px 8px',
    border: `1px solid ${DARK_BORDER}`,
    backgroundColor: BLUE,
    color: '#ffffff',
    fontWeight: '700',
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
    ...extra,
  });

  /* ── render ─────────────────────────────────────── */
  return (
    <div
      id="quotation-print-root"
      ref={ref}
      className="print-container bg-white"
      style={{
        width: '100%',
        maxWidth: '210mm',
        margin: '0 auto',
        /* minHeight removed from inline style — handled by the
           screen-only @media rule above so print can flow freely */
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        fontSize: '11px',
        color: DARK,
        backgroundColor: '#ffffff',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* ── HEADER ─────────────────────────────────── */}
      <Header />

      {/* ── BODY ───────────────────────────────────── */}
      <div style={{ flex: 1, padding: '16px 20px' }}>

        {/* TITLE */}
        <div style={{ textAlign: 'center', margin: '12px 0 16px' }}>
          <h1 style={{
            fontSize: '22px', fontWeight: '900',
            letterSpacing: '4px', color: BLUE, margin: 0,
          }}>
            QUOTATION
          </h1>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px', marginTop: '6px',
          }}>
            <div style={{ width: '60px', height: '2px', backgroundColor: BLUE }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: GREEN }} />
            <div style={{ width: '60px', height: '2px', backgroundColor: BLUE }} />
          </div>
        </div>

        {/* CUSTOMER + QUOTATION INFO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '14px' }}>

          {/* Left – customer */}
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: '11px', color: MUTED }}>To,</p>
            <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '12px', color: DARK }}>
              {formData.customerName || 'Customer Name'}
            </p>
            {formData.address && (
              <p style={{ margin: '0 0 2px', color: MID, whiteSpace: 'pre-line' }}>{formData.address}</p>
            )}
          </div>

          {/* Right – quotation details */}
          <div style={{ minWidth: '240px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <tbody>
                {infoRows.map(([label, value], i) => (
                  <tr key={i}>
                    <td style={{ padding: '2px 8px 2px 0', color: MUTED, whiteSpace: 'nowrap', fontWeight: '500' }}>
                      {label}
                    </td>
                    <td style={{ padding: '2px 4px', color: MUTED }}>:</td>
                    <td style={{ padding: '2px 0', color: DARK, fontWeight: '600' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          marginBottom: '16px', fontSize: '11px',
        }}>
          <thead>
            <tr>
              <th style={headerCell({ textAlign: 'center', width: '32px' })}>S.#</th>
              <th style={headerCell({ textAlign: 'left' })}>DESCRIPTION</th>
              <th style={headerCell({ textAlign: 'center', width: '44px' })}>QTY</th>
              <th style={headerCell({ textAlign: 'center', width: '52px' })}>UNIT</th>
              <th style={headerCell({ textAlign: 'right', width: '110px' })}>
                <span style={{ fontSize: '9px' }}>UNIT </span>PRICE (PKR)
              </th>
              <th style={headerCell({ textAlign: 'right', width: '110px' })}>
                TOTAL PRICE (PKR)
              </th>
            </tr>
          </thead>
          <tbody>
            {formData.products.map((product, index) => {
              const rowTotal = (product.quantity || 0) * (product.unitPrice || 0);
              const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
              return (
                <tr key={product.id || index} style={{ backgroundColor: rowBg }}>
                  <td style={cell({ textAlign: 'center', color: '#64748b', fontWeight: '600' })}>
                    {index + 1}
                  </td>
                  <td style={cell({ color: DARK, fontWeight: '500' })}>
                    {product.name || (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Empty Item</span>
                    )}
                  </td>
                  <td style={cell({ textAlign: 'center', color: MID })}>
                    {product.quantity}
                  </td>
                  <td style={cell({ textAlign: 'center', color: MID })}>
                    {product.unit}
                  </td>
                  <td style={cell({ textAlign: 'right', color: MID })}>
                    {formatPKR(product.unitPrice || 0)}
                  </td>
                  <td style={cell({ textAlign: 'right', color: DARK, fontWeight: '600' })}>
                    {formatPKR(rowTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* TOTALS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <div style={{ minWidth: '220px' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              fontSize: '11px', border: `1px solid ${BORDER}`,
            }}>
              <tbody>
                {/* Sub Total */}
                <tr>
                  <td style={cell({ fontWeight: '600', color: MUTED })}>SUB TOTAL</td>
                  <td style={cell({ textAlign: 'right', fontWeight: '600', color: DARK })}>
                    {formatPKR(subTotal)}
                  </td>
                </tr>

                {/* Discount */}
                <tr>
                  <td style={cell({ fontWeight: '600', color: MUTED })}>DISCOUNT</td>
                  <td style={cell({ textAlign: 'right', fontWeight: '600', color: discount > 0 ? '#dc2626' : DARK })}>
                    {discount > 0 ? `-${formatPKR(discount)}` : formatPKR(0)}
                  </td>
                </tr>

                {/* GST */}
                <tr>
                  <td style={cell({ fontWeight: '600', color: MUTED })}>GST ({taxRate}%)</td>
                  <td style={cell({ textAlign: 'right', fontWeight: '600', color: DARK })}>
                    {formatPKR(tax)}
                  </td>
                </tr>

                {/* Grand Total — green background, must print */}
                <tr>
                  <td style={{
                    padding: '9px 12px',
                    fontWeight: '800',
                    fontSize: '12px',
                    color: '#ffffff',
                    backgroundColor: GREEN,
                    border: `1px solid #17916a`,
                    letterSpacing: '0.5px',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}>
                    GRAND TOTAL
                  </td>
                  <td style={{
                    padding: '9px 12px',
                    textAlign: 'right',
                    fontWeight: '900',
                    fontSize: '13px',
                    color: '#ffffff',
                    backgroundColor: GREEN,
                    border: `1px solid #17916a`,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}>
                    {formatPKR(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PARTNER BRANDS */}
      <div style={{ padding: '0 20px' }}>
        <PartnerBrands />
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
});

QuotationPreview.displayName = 'QuotationPreview';
export default QuotationPreview;