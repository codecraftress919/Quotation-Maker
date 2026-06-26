import React from 'react';
import ProductTable from './ProductTable';
import { User, FileText, Calculator, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateGrandTotal } from '../utils/calculations';

const QuotationForm = ({ formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Card Animation Settings
  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 120 } 
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Customer Information Card */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 md:p-6 shadow-soft border border-slate-100/80 hover:shadow-premium transition-all duration-300"
      >
        <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Customer Information</h2>
            <p className="text-xs text-slate-500">Details of the client receiving this quote</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Customer Name
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows="3"
              placeholder="e.g. 123 Solar Way, Sunnyville"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all resize-none"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="e.g. +1 (555) 000-0000"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Quotation Information Card */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 md:p-6 shadow-soft border border-slate-100/80 hover:shadow-premium transition-all duration-300"
      >
        <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Quotation Information</h2>
            <p className="text-xs text-slate-500">Reference number, dates and contract parameters</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Quotation Number
              </label>
              <input
                type="text"
                value={formData.quotationNumber}
                onChange={(e) => handleInputChange('quotationNumber', e.target.value)}
                placeholder="e.g. QT-2026-001"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Valid Until
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Sales Representative
              </label>
              <input
                type="text"
                value={formData.salesPerson}
                onChange={(e) => handleInputChange('salesPerson', e.target.value)}
                placeholder="Name of agent"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Delivery Timeframe
              </label>
              <input
                type="text"
                value={formData.deliveryTime}
                onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                placeholder="e.g. 7-10 Days"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Payment Terms
              </label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                placeholder="e.g. 50% Advance, 50% Delivery"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Section (delegates to ProductTable) */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <ProductTable 
          products={formData.products} 
          setProducts={(products) => setFormData({ ...formData, products })} 
        />
      </motion.div>

      {/* Pricing Summary Card */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 md:p-6 shadow-soft border border-slate-100/80 hover:shadow-premium transition-all duration-300"
      >
        <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Pricing Summary</h2>
            <p className="text-xs text-slate-500">Configure discounts, taxes and final billing total</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Discount Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                type="number"
                value={formData.discount || ''}
                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all text-rose-600 font-semibold"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Tax / GST Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.taxRate || ''}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full pr-8 pl-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all text-slate-700 font-semibold"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Grand Total ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                type="text"
                value={calculateGrandTotal(formData).toFixed(2)}
                readOnly
                className="w-full pl-7 pr-3 py-3 border border-slate-100 rounded-xl bg-slate-50 text-slate-800 text-sm font-extrabold"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notes & Terms Section Card */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 md:p-6 shadow-soft border border-slate-100/80 hover:shadow-premium transition-all duration-300"
      >
        <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Notes & Terms</h2>
            <p className="text-xs text-slate-500">Fine print and comments regarding this quotation</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              rows="4"
              placeholder="e.g. Standard warranties apply. Dynamic price variations subject to vendor inventory."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows="3"
              placeholder="e.g. Thank you for choosing Abdullah Traders Solar Solutions!"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm transition-all resize-none"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuotationForm;
