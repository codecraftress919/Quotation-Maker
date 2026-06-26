import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, RotateCcw, Sun, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import QuotationForm from '../components/QuotationForm';
import QuotationPreview from '../components/QuotationPreview';

const CreateQuotation = () => {
  const navigate = useNavigate();

  // Initial form data
  const initialFormData = {
    customerName: '',
    companyName: '',
    address: '',
    phoneNumber: '',
    quotationNumber: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    salesPerson: '',
    deliveryTime: '',
    paymentTerms: '',
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
    terms: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  // Open preview in a new tab
  const handlePreview = () => {
    localStorage.setItem('quotationPreviewData', JSON.stringify(formData));
    window.open('/preview', '_blank');
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
    </motion.div>
  );
};

export default CreateQuotation;
