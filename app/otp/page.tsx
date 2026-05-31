"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f6] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[480px] bg-white rounded-[40px] shadow-2xl shadow-emerald-900/5 border border-white p-10 md:p-12 text-center"
      >
        {/* Success Icon Animation */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute inset-0 bg-emerald-100 rounded-full"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute inset-0 flex items-center justify-center text-[#16a34a]"
          >
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2 text-emerald-400"
          >
            <Sparkles size={24} />
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold text-[#064e3b] mb-4">
          Pendaftaran Berhasil!
        </h1>

        <p className="text-gray-500 text-[14px] leading-relaxed mb-10 px-4">
          Selamat datang di ekosistem finansial hijau. Akun Anda telah aktif dan siap digunakan untuk masa depan yang lebih lestari.
        </p>

        {/* Action Button */}
        <Link href="/login" className="block w-full">
          <button className="w-full bg-[#0d5c46] hover:bg-[#0a4736] text-white rounded-2xl py-4 text-[16px] font-bold flex justify-center items-center gap-3 transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98]">
            Masuk ke Dashboard <ArrowRight size={20} />
          </button>
        </Link>

        {/* Security Badge */}
        <div className="mt-10 flex items-center justify-center gap-2 text-emerald-700/50">
          <ShieldCheck size={16} />
          <span className="text-[11px] font-bold tracking-widest uppercase">Data Terenkripsi & Aman</span>
        </div>
      </motion.div>

      {/* Footer Minimalist */}
      <p className="mt-8 text-[12px] text-gray-400 font-medium">
        © 2026 Green Banking Nusantara
      </p>
    </main>
  );
}

// trigger git update paksa