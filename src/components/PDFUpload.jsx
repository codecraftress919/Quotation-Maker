import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PDFUpload = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const processFile = (file) => {
    setError(null);

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setUploadedFile(file);
    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />

      {!uploadedFile ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50/50'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="flex flex-col items-center gap-6">
            {/* Upload Icon */}
            <motion.div
              animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isDragging ? 'bg-primary/20' : 'bg-primary/10'
              }`}
            >
              <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-primary/70'}`} />
            </motion.div>

            {/* Text Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">
                Upload Quotation PDF
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Drag & drop your PDF here, or click to browse files
              </p>
            </div>

            {/* Supported File Types */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">
                PDF Documents
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">
                Max 10MB
              </span>
            </div>

            {/* Mobile-specific hint */}
            <div className="sm:hidden mt-2">
              <p className="text-xs text-slate-400">
                Tap to open file picker
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-emerald-200 p-6 shadow-soft"
        >
          <div className="flex items-center gap-4">
            {/* File Icon */}
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              {isProcessing ? (
                <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
              ) : (
                <FileText className="w-7 h-7 text-emerald-600" />
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {/* Status Icon */}
            {isProcessing ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="text-xs font-semibold">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs font-semibold">Ready</span>
              </div>
            )}

            {/* Remove Button */}
            {!isProcessing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="p-2 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-rose-500" />
              </button>
            )}
          </div>

          {/* Progress Bar (when processing) */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Extracting text from PDF...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDFUpload;
