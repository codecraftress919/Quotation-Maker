import React, { useRef, useEffect, useState } from 'react';
import { Printer, Sun, ArrowLeft } from 'lucide-react';
import QuotationPreview from '../components/QuotationPreview';

const PreviewQuotation = () => {
  const previewRef = useRef(null);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('quotationPreviewData');
      if (stored) {
        setFormData(JSON.parse(stored));
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    }
  }, []);

  // ── THE FIX: clone DOM into a hidden iframe and print from it ──────────────
  const handlePrint = () => {
    if (isPrinting || !previewRef.current) return;
    setIsPrinting(true);

    // Gather ALL stylesheets from the current page
    const styleSheets = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          // Cross-origin sheets — link them by href instead
          if (sheet.href) {
            return `@import url("${sheet.href}");`;
          }
          return '';
        }
      })
      .join('\n');

    // Clone the quotation HTML
    const contentHTML = previewRef.current.outerHTML;

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      position: fixed;
      top: -10000px;
      left: -10000px;
      width: 210mm;
      height: 297mm;
      border: none;
      opacity: 0;
      pointer-events: none;
    `;
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Quotation-${formData?.quotationNumber || 'Draft'}</title>
          <style>
            /* All styles from the parent page */
            ${styleSheets}

            /* Print-specific overrides */
            @page {
              size: A4;
              margin: 8mm 10mm;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }

            body {
              width: 210mm;
            }

            .print-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            table { page-break-inside: auto; }
            tr    { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
          </style>
        </head>
        <body>
          ${contentHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for iframe to fully load, then print
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.error('iframe print failed:', e);
          // Fallback: open in new window
          const win = window.open('', '_blank', 'width=800,height=900');
          win.document.write(iframeDoc.documentElement.outerHTML);
          win.document.close();
          win.focus();
          win.print();
          win.close();
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe);
            setIsPrinting(false);
          }, 1000);
        }
      }, 500); // give iframe CSS time to apply
    };
  };

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="bg-white rounded-2xl shadow-soft p-10 max-w-sm w-full">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">No Preview Data Found</h1>
          <p className="text-slate-500 text-sm mb-6">
            Please go back to the quotation form and click "Preview" to generate a preview.
          </p>
          <button
            onClick={() => window.close()}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading preview...</p>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Sun className="w-4 h-4 text-primary" />
            </div>
            <span className="font-extrabold text-sm text-slate-700 tracking-tight">
              Abdullah<span className="text-secondary">Traders</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-sm sm:text-base font-bold text-slate-700 absolute left-1/2 -translate-x-1/2">
            Quotation Preview
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.close()}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Document */}
      <div className="py-8 px-4">
        <div className="shadow-lg rounded-lg overflow-hidden max-w-[210mm] mx-auto">
          <QuotationPreview ref={previewRef} formData={formData} />
        </div>
      </div>

    </div>
  );
};

export default PreviewQuotation;