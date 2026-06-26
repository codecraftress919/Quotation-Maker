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
  @media print {
    @page {
      size: A4;
      margin: 8mm 10mm;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
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
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      page-break-inside: avoid;
    }

    /* Force background colors to print */
    [data-print-bg] {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    table { page-break-inside: auto; }
    tr    { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }

    .signature-section {
      page-break-inside: avoid;
    }
  }
`;

if (typeof document !== 'undefined') {
  const id = 'quotation-preview-print-css';
  if (!document.getElementById(id)) {
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

  const termLines = formData.terms
    ? formData.terms.split('\n').filter((l) => l.trim())
    : [
        'Prices are subject to change without prior notice.',
        'This quotation is valid for the period mentioned above.',
        'Payment must be made as per terms mentioned.',
        'Any bank charges will be borne by the customer.',
      ];

  const infoRows = [
    ['Quotation No',   formData.quotationNumber || 'Draft'],
    ['Quotation Date', formatDate(formData.date)],
    formData.validUntil    ? ['Valid Till',      formatDate(formData.validUntil)] : null,
    formData.paymentTerms  ? ['Payment Terms',   formData.paymentTerms]           : null,
    formData.deliveryTime  ? ['Delivery Time',   formData.deliveryTime]           : null,
    formData.salesPerson   ? ['Sales Person',    formData.salesPerson]            : null,
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
        minHeight: '297mm',
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
            {formData.companyName && (
              <p style={{ margin: '0 0 2px', color: MID }}>{formData.companyName}</p>
            )}
            {formData.address && (
              <p style={{ margin: '0 0 2px', color: MID, whiteSpace: 'pre-line' }}>{formData.address}</p>
            )}
            {formData.phoneNumber && (
              <p style={{ margin: 0, color: MID }}>Phone: {formData.phoneNumber}</p>
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

        {/* TERMS + TOTALS */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '16px' }}>

          {/* Left – Terms */}
          <div style={{ flex: 1 }}>
            <p style={{
              margin: '0 0 6px', fontWeight: '800', fontSize: '11px',
              color: DARK, textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              TERMS &amp; CONDITIONS
            </p>
            <ul style={{ margin: 0, paddingLeft: '14px', color: MID, lineHeight: '1.7', fontSize: '10.5px' }}>
              {termLines.map((line, i) => (
                <li key={i} style={{ marginBottom: '2px' }}>{line}</li>
              ))}
            </ul>
            <p style={{ marginTop: '12px', color: GREEN, fontStyle: 'italic', fontSize: '11px', fontWeight: '600' }}>
              Thank you for giving us the opportunity to serve you.
            </p>
          </div>

          {/* Right – Totals */}
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

        {/* AUTHORIZED SIGNATURE */}
        <div className="signature-section" style={{ marginTop: '24px', marginBottom: '16px' }}>
          <div style={{ width: '140px' }}>
            <div style={{ height: '36px', borderBottom: `1.5px solid ${DARK}`, marginBottom: '6px' }} />
            <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: DARK }}>
              Authorized Signature
            </p>
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