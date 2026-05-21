"use client";

import Link from "next/link";
import { Lock, Leaf, ArrowLeft } from "lucide-react";

export default function VerifyOTPPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f6] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* Background Glow Effect */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-100 rounded-full blur-[100px] opacity-60"></div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold text-[#064e3b] mb-10 text-center">
          Verifikasi Keamanan
        </h1>

        {/* Main Card Container */}
        <div className="bg-white/90 backdrop-blur-xl w-full max-w-[420px] rounded-[32px] shadow-2xl shadow-emerald-900/5 border border-white p-8 md:p-10 flex flex-col items-center text-center">

          {/* Lock Icon */}
          <div className="w-14 h-14 bg-[#dcfce7] text-[#16a34a] rounded-full flex items-center justify-center mb-6">
            <Lock size={22} strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-3 font-serif">Verifikasi OTP</h2>
          <p className="text-[13px] text-gray-500 mb-8 px-2 leading-relaxed">
            Kami telah mengirimkan 6 digit kode ke WhatsApp Anda di <span className="font-semibold text-gray-800">+62812-9872-xxxx</span>.
          </p>

          {/* OTP Input Fields */}
          <div className="flex gap-2 sm:gap-3 mb-8 justify-center w-full">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="w-11 h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all outline-none"
              />
            ))}
          </div>

          {/* Verify Button */}
          <Link href="/register/success" className="w-full">
            <button className="w-full bg-[#0d5c46] hover:bg-[#0a4736] text-white rounded-xl py-3.5 text-[15px] font-semibold transition-all shadow-lg shadow-emerald-900/10 mb-6 active:scale-[0.98]">
              Verifikasi
            </button>
          </Link>

          {/* Resend Link */}
          <button className="text-[13px] font-semibold text-[#0d5c46] hover:text-[#064e3b] mb-8 transition-colors">
            Kirim ulang kode (00:59)
          </button>

          {/* Eco-Friendly Info Badge */}
          <div className="flex gap-3 items-start text-left bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
            <Leaf className="w-4 h-4 text-[#16a34a] mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-[#064e3b] leading-relaxed font-medium">
              Kenapa WhatsApp? Verifikasi digital kami memangkas penggunaan SMS tradisional, berkontribusi pada pengurangan jejak karbon infrastruktur telko.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <Link href="/register" className="mt-8 flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-emerald-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke pendaftaran
        </Link>
      </div>

    </main>
  );
}