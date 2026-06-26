import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, RotateCcw, Sun, Sparkles, X, Printer, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import QuotationForm from '../components/QuotationForm';
import QuotationPreview from '../components/QuotationPreview';

const CreateQuotation = () => {
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Initial form data
  const initialFormData = {
    customerName: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    products: [
      {
        id: Date.now(),
        name: '',
        quantity: 1,
        unit: 'pcs',
        unitPrice: 0,
      }
    ],
    discount: 0,
    taxRate: 0,
  };

  const [formData, setFormData] = useState(initialFormData);

  // Open preview dialog
  const handlePreview = () => {
    setShowPreviewDialog(true);
  };

  // Close preview dialog
  const handleCloseDialog = () => {
    setShowPreviewDialog(false);
  };

  // Print quotation and save to gallery
  const handlePrint = () => {
    if (isPrinting || !previewRef.current) return;
    setIsPrinting(true);

    // Gather ALL stylesheets from the current page. This already
    // includes the #quotation-preview-print-css <style> tag that
    // QuotationPreview.jsx injects into document.head, which contains
    // the correct "HYBRID STRATEGY" @media print rules (min-height,
    // natural multi-page flow, repeating <thead>, footer pinned only
    // when there's leftover space on a short quotation). We must NOT
    // re-declare .print-container rules below — doing so previously
    // re-introduced a fixed-height + overflow:hidden clip that
    // silently dropped any rows (and the footer) past page 1.
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
            /* All styles from the parent page — this already carries
               the correct multi-page print rules from
               QuotationPreview.jsx's injected <style id="quotation-preview-print-css">.
               Do NOT add another .print-container height/overflow
               override here; see comment above handlePrint. */
            ${styleSheets}

            /* Print-specific overrides that DON'T fight pagination */
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

  // Reset form
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All inputted data will be lost.')) {
      setFormData({
        ...initialFormData,
        date: new Date().toISOString().split('T')[0],
        products: [
          {
            id: Date.now(),
            name: '',
            quantity: 1,
            unit: 'pcs',
            unitPrice: 0,
          }
        ]
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-brand-bg flex flex-col pb-24 lg:pb-8"
    >
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-slate-600 hover:text-slate-900 font-semibold text-sm gap-1.5 py-1.5 px-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center space-x-1.5">
            <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
              Create Quotation
            </h1>
            <div className="hidden xs:flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              Live Sync
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
              <Sun className="w-4 h-4 text-primary" />
            </div>
            <span className="font-extrabold text-xs text-slate-700 tracking-tight hidden sm:block">
              Abdullah<span className="text-secondary font-bold">Traders</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-grow">

        {/* Desktop Layout: Side by Side (Form on Left, Preview on Right) */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">

          {/* Form Column */}
          <div className="lg:col-span-6 space-y-6">
            <QuotationForm formData={formData} setFormData={setFormData} />
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-120px)] flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Quotation Live Preview</h2>
                  <p className="text-xs text-slate-500">Real-time formal document output</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer touch-manipulation border border-slate-200"
                    title="Reset Form"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePreview}
                    className="bg-gradient-to-r from-secondary to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer touch-manipulation"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Preview & Print</span>
                  </button>
                </div>
              </div>

              <div className="flex-grow border border-slate-200 rounded-2xl overflow-y-auto bg-slate-100/50 p-4 shadow-inner">
                <QuotationPreview formData={formData} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Stacked Layout — form only, no inline preview */}
        <div className="lg:hidden space-y-6">
          <QuotationForm formData={formData} setFormData={setFormData} />

          {/* Preview CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-5 flex flex-col items-center text-center gap-3 shadow-soft"
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Ready to Preview?</h3>
              <p className="text-slate-500 text-xs mt-1">
                Open the quotation in a new tab to review and print as PDF
              </p>
            </div>
            <button
              onClick={handlePreview}
              className="w-full bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <Eye className="w-4 h-4" />
              Preview Quotation
            </button>
          </motion.div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-lg px-4 py-3 z-40">
        <div className="max-w-7xl mx-auto flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handlePreview}
            className="flex-[2] bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer touch-manipulation"
          >
            <Eye className="w-4 h-4" />
            <span>Preview & Print</span>
          </button>
        </div>
      </div>

      {/* Preview Dialog Modal */}
      {showPreviewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Quotation Preview</h2>
                <p className="text-xs text-slate-500">Review and save your quotation</p>
              </div>
              <button
                onClick={handleCloseDialog}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer touch-manipulation"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Dialog Content - Scrollable Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-[210mm] mx-auto" style={{ transform: 'none' }}>
                <QuotationPreview ref={previewRef} formData={formData} />
              </div>
            </div>

            {/* Dialog Footer - Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
              <button
                onClick={handleCloseDialog}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-semibold text-sm transition-all cursor-pointer touch-manipulation"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPrinting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Preparing...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Print / Save PDF</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CreateQuotation;