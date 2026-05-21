"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-6 font-sans relative overflow-hidden">

      {/* Efek Cahaya Hijau di Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] opacity-40"></div>

      {/* Card Utama */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white w-full max-w-lg rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-white p-12 flex flex-col items-center text-center"
      >

        {/* Gambar Tanaman dengan Badge Centang */}
        <div className="relative mb-8">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?q=80&w=2574&auto=format&fit=crop"
              alt="Succulent Plant"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Badge Centang Hijau */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute bottom-2 right-2 w-10 h-10 bg-[#a3b86c] rounded-full border-4 border-white flex items-center justify-center text-emerald-950 shadow-lg"
          >
            <Check size={20} strokeWidth={4} />
          </motion.div>
        </div>

        {/* Teks Ucapan Selamat */}
        <h1 className="text-[32px] font-bold text-[#064e3b] leading-tight mb-4 px-4">
          Selamat Akun Anda <br /> Berhasil Dibuat!
        </h1>

        <div className="space-y-1 mb-10">
          <p className="text-gray-800 font-medium">Halo, Pandu Aji Santoso.</p>
          <p className="text-gray-400 text-sm">
            Mari mulai langkah hijau Anda bersama Green Banking.
          </p>
        </div>

        {/* Tombol Masuk ke Dashboard */}
        <Link href="/dashboard" className="w-full">
          <button className="w-full bg-[#064e3b] hover:bg-[#084d39] text-white rounded-full py-4 px-8 font-semibold flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98]">
            Masuk ke Dashboard <ArrowRight size={20} />
          </button>
        </Link>

        {/* Footer Kecil */}
        <div className="mt-12 text-[10px] text-gray-300 font-medium tracking-wider uppercase flex items-center gap-2">
          <span>Pendaftaran Selesai</span>
          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
          <span>Green Banking Nusantara 2024</span>
        </div>

      </motion.div>
    </main>
  );
}