import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, RotateCcw, Sun, Sparkles, X, Printer, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PDFUpload from '../components/PDFUpload';
import QuotationForm from '../components/QuotationForm';
import QuotationPreview from '../components/QuotationPreview';
import { extractTextFromPDF } from '../utils/pdfExtractor';
import { parseQuotationText } from '../utils/quotationParser';

const EditQuotation = () => {
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionError, setExtractionError] = useState(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  // Handle PDF file selection
  const handleFileSelect = async (file) => {
    setIsExtracting(true);
    setExtractionProgress(0);
    setExtractionError(null);
    setExtractionSuccess(false);

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file, (progress) => {
        setExtractionProgress(progress);
      });

      console.log('Extracted text:', text);
      console.log('Extracted text length:', text.length);

      // Parse the extracted text
      const parsedData = parseQuotationText(text);

      console.log('Parsed data:', parsedData);

      // Update form data with parsed data
      setFormData({
        ...initialFormData,
        customerName: parsedData.customerName || '',
        address: parsedData.address || '',
        date: parsedData.date || new Date().toISOString().split('T')[0],
        validUntil: parsedData.validUntil || '',
        products: parsedData.products.length > 0 
          ? parsedData.products.map(p => ({
              ...p,
              id: Date.now() + Math.random()
            }))
          : initialFormData.products,
        discount: parsedData.discount || 0,
        taxRate: parsedData.taxRate || 0,
      });

      // Show success even if minimal data was extracted
      const hasSomeData = parsedData.customerName || parsedData.products.length > 0;
      
      if (hasSomeData) {
        setExtractionSuccess(true);
      } else {
        // If no meaningful data was extracted, show a warning but still proceed
        setExtractionError('Limited data extracted from PDF. Please review and complete the form manually.');
      }
      
      setTimeout(() => {
        setShowForm(true);
      }, 1000);
    } catch (error) {
      console.error('Extraction error:', error);
      setExtractionError(error.message || 'Failed to extract data from PDF. Please try again or enter data manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Reset to upload state
  const handleResetUpload = () => {
    setShowForm(false);
    setExtractionSuccess(false);
    setExtractionError(null);
    setFormData(initialFormData);
  };

  // Open preview dialog
  const handlePreview = () => {
    setShowPreviewDialog(true);
  };

  // Close preview dialog
  const handleCloseDialog = () => {
    setShowPreviewDialog(false);
  };

  // Print quotation
  const handlePrint = () => {
    if (isPrinting || !previewRef.current) return;
    setIsPrinting(true);

    const styleSheets = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          if (sheet.href) {
            return `@import url("${sheet.href}");`;
          }
          return '';
        }
      })
      .join('\n');

    const contentHTML = previewRef.current.outerHTML;

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
          <title>Quotation-Edited</title>
          <style>
            ${styleSheets}
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

    iframe.onload = () => {
      setTimeout(() => {
        // Detect mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Mobile: open in new window for better compatibility
          try {
            const win = window.open('', '_blank');
            if (win) {
              win.document.write(iframeDoc.documentElement.outerHTML);
              win.document.close();
              setTimeout(() => {
                win.focus();
                win.print();
              }, 500);
            } else {
              console.error('Popup blocked on mobile');
              alert('Please allow popups to print the quotation');
            }
          } catch (e) {
            console.error('Mobile print failed:', e);
            alert('Printing failed. Please try again or use a desktop device.');
          }
        } else {
          // Desktop: use iframe print
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          } catch (e) {
            console.error('iframe print failed:', e);
            const win = window.open('', '_blank', 'width=800,height=900');
            win.document.write(iframeDoc.documentElement.outerHTML);
            win.document.close();
            win.focus();
            win.print();
            win.close();
          }
        }
        
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsPrinting(false);
        }, 1000);
      }, 500);
    };
  };

  // Reset form
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All changes will be lost.')) {
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
              Edit Quotation
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
        {!showForm ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-black text-slate-800">
                Upload Quotation PDF
              </h2>
              <p className="text-slate-500 text-sm">
                We'll automatically extract the data and populate the form for you
              </p>
            </motion.div>

            <PDFUpload 
              onFileSelect={handleFileSelect} 
              isProcessing={isExtracting}
            />

            {/* Extraction Success Message */}
            <AnimatePresence>
              {extractionSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-800">
                      Data extracted successfully!
                    </p>
                    <p className="text-xs text-emerald-600">
                      Review and edit the extracted information below
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extraction Error Message */}
            <AnimatePresence>
              {extractionError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800">
                      Extraction Issue
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {extractionError}
                    </p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800 underline"
                    >
                      Continue to manual entry →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Entry Option */}
            {!isExtracting && !extractionSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <button
                  onClick={() => setShowForm(true)}
                  className="text-sm text-slate-500 hover:text-slate-700 underline cursor-pointer"
                >
                  Or enter data manually
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          /* Form Section */
          <>
            {/* Back to Upload Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleResetUpload}
              className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Upload a different PDF
            </motion.button>

            {/* Desktop Layout: Side by Side */}
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

            {/* Mobile / Tablet Stacked Layout */}
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
          </>
        )}
      </div>

      {/* Sticky Bottom Action Bar (Mobile only) */}
      {showForm && (
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
      )}

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

export default EditQuotation;
