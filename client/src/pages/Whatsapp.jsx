import React from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Globe
} from "lucide-react";

export default function WhatsApp() {
  // Destination URL for your WhatsApp marketing software website
  const TARGET_WEBSITE_URL = "https://yourwhatsappmarketingapp.com";

  const handleOpenWebsite = () => {
    window.open(TARGET_WEBSITE_URL, "_blank");
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: custom * 0.08, ease: "easeOut" }
    })
  };

  return (
    <div className="w-full bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      
      {/* Clean, Professional Hero Banner Container */}
      <div className="relative w-full max-w-6xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/60 overflow-hidden">
        
        {/* Subtle Background Accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* =========================================================================
              LEFT COLUMN: HEADLINE, DESCRIPTION & HIGH-CONVERTING CTA
             ========================================================================= */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Meta Official API Badge */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wide"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Official Meta Business API Platform</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]"
            >
              Supercharge Sales with{" "}
              <span className="text-emerald-600">
                WhatsApp Automation
              </span>
            </motion.h1>

            {/* Concise Description */}
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-base text-slate-600 font-normal leading-relaxed"
            >
              Send verified 1-click bulk broadcasts with 98% open rates, automate customer support with 24/7 AI chatbots, and seamlessly convert Instagram DM leads.
            </motion.p>

            {/* Quick Key Benefits Grid */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="grid grid-cols-2 gap-3 pt-1 text-xs sm:text-sm text-slate-700 font-medium"
            >
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><b>98% Open Rate</b> Messages</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><b>0% Ban Risk</b> Official API</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><b>24/7 AI Lead Bot</b></span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><b>Instagram DM Sync</b></span>
              </div>
            </motion.div>

            {/* High Converting CTA Button */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <button
                onClick={handleOpenWebsite}
                className="group relative inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>START WHATSAPP MARKETING NOW</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Micro Trust Indicators */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={5}
              className="flex items-center gap-6 text-xs text-slate-500 pt-1"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Meta Verified Partner
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" /> Instant 5-Min Setup
              </span>
              <button 
                onClick={handleOpenWebsite}
                className="flex items-center gap-1 text-emerald-600 font-semibold hover:underline cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" /> Visit Platform
              </button>
            </motion.div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: CLEAN WHATSAPP MARKETING IMAGE ILLUSTRATION
             ========================================================================= */}
          <div className="lg:col-span-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-2 shadow-lg overflow-hidden group"
            >
              <img
                src="input_file_0.png"
                alt="WhatsApp Marketing Automation Software"
                className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </motion.div>
          </div>

        </div>
      </div>

    </div>
  );
}