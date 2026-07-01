import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Sun, Sparkles, ShieldCheck, ArrowRight, Zap, FilePen } from 'lucide-react';
import { motion } from 'framer-motion';
import heroLogo from '../assets/header.png';

const Dashboard = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-100 py-4 px-6 md:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-xl text-white shadow-md">
              <Sun className="w-5 h-5 text-accent" />
            </div>
            <span className="font-extrabold text-lg text-slate-800 tracking-tight">
              Abdullah<span className="text-secondary">Traders</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>Secure Portal</span>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl space-y-8"
        >
          {/* Hero Logo + Welcome */}
          <motion.div variants={cardVariants} className="text-center space-y-5">
            {/* Company Logo */}
            <div className="flex justify-center">
              <img
                src={heroLogo}
                alt="Abdullah Traders"
                className="h-40 sm:h-48 w-auto object-contain drop-shadow-md"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-xs font-bold text-primary shadow-sm border border-primary/5">
              <Sparkles className="w-3.5 h-3.5 text-accent fill-accent" />
              <span>Solar Quotation Platform</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
              Empower Your{' '}
              <span className="bg-gradient-to-r from-primary via-blue-700 to-secondary bg-clip-text text-transparent">
                Solar Business
              </span>
            </h1>
            <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
              Create professional PDF quotations instantly — on mobile or desktop.
            </p>
          </motion.div>

          {/* Create New Quotation — Full Width Big Card */}
          <motion.button
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/create-quotation')}
            className="w-full text-left relative overflow-hidden bg-gradient-to-br from-primary to-blue-800 text-white p-7 sm:p-10 rounded-3xl shadow-premium cursor-pointer group transition-all"
          >
            {/* Background glow */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-72 h-72 bg-secondary/20 rounded-full filter blur-3xl group-hover:bg-secondary/30 transition-all duration-500" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full filter blur-2xl" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="bg-white/15 w-fit p-4 rounded-2xl border border-white/10">
                  <PlusCircle className="w-9 h-9 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Create New Quotation
                  </h2>
                  <p className="text-sm text-slate-200 mt-2 opacity-90 font-medium max-w-xs">
                    Fill in customer details, add products, set pricing and instantly preview or print as PDF.
                  </p>
                </div>
              </div>

              <div className="bg-white text-primary p-4 rounded-2xl group-hover:translate-x-2 transition-transform shadow-lg self-end sm:self-center shrink-0">
                <ArrowRight className="w-7 h-7" />
              </div>
            </div>
          </motion.button>

          {/* Edit Existing Quotation — Premium Card */}
          <motion.button
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/edit-quotation')}
            className="w-full text-left relative overflow-hidden bg-gradient-to-br from-secondary to-emerald-700 text-white p-7 sm:p-10 rounded-3xl shadow-premium cursor-pointer group transition-all"
          >
            {/* Background glow */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full filter blur-2xl" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="bg-white/15 w-fit p-4 rounded-2xl border border-white/10">
                  <FilePen className="w-9 h-9 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Edit Existing Quotation
                  </h2>
                  <p className="text-sm text-slate-200 mt-2 opacity-90 font-medium max-w-xs">
                    Upload an existing quotation PDF, edit it, and generate a new quotation.
                  </p>
                </div>
              </div>

              <div className="bg-white text-secondary p-4 rounded-2xl group-hover:translate-x-2 transition-transform shadow-lg self-end sm:self-center shrink-0">
                <ArrowRight className="w-7 h-7" />
              </div>
            </div>
          </motion.button>

          {/* Info chips */}
          <motion.div variants={cardVariants} className="flex flex-wrap justify-center gap-3">
            {[
              { icon: <Zap className="w-3.5 h-3.5" />, label: 'Instant PDF' },
              { icon: <Sun className="w-3.5 h-3.5" />, label: 'Solar Focused' },
              { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'PKR Currency' },
            ].map((chip) => (
              <div
                key={chip.label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-semibold text-slate-600 shadow-soft"
              >
                <span className="text-primary">{chip.icon}</span>
                {chip.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-5 border-t border-slate-100 text-center text-slate-400 text-xs">
        <p>© 2026 Abdullah Traders. All rights reserved.</p>
        <p className="mt-1 font-medium text-slate-300">Solar Energy Solutions — Islamabad, Pakistan</p>
      </footer>
    </div>
  );
};

export default Dashboard;
