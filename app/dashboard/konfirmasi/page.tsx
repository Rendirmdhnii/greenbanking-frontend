"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Leaf, Check
} from "lucide-react";
import { useUserContext } from "@/hooks/useUserData";

export default function KonfirmasiPage() {
  const userHook = useUserContext();

  return (
    <>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col items-center justify-center p-8"
        >
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/5 overflow-hidden border border-gray-100 relative">
            <div className="h-32 bg-[#064e3b] absolute top-0 w-full left-0 z-0">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            </div>
            
            <div className="relative z-10 p-8 pt-12 flex flex-col items-center text-center">
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 relative"
              >
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                <div className="w-16 h-16 bg-[#16a34a] rounded-full flex items-center justify-center text-white">
                  <Check size={40} strokeWidth={3} />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Transaksi Berhasil!</h2>
              <p className="text-gray-500 text-sm mb-8">
                {new Date().toLocaleString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
              </p>
              
              <div className="w-full bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-4">
                  <span className="text-gray-500">Penerima</span>
                  <span className="font-bold text-gray-900 text-right">Restorasi Mangrove Bali<br/><span className="text-xs text-gray-500 font-normal">Yayasan Lindungi Hutan</span></span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-4">
                  <span className="text-gray-500">ID Transaksi</span>
                  <span className="font-mono text-gray-700 font-semibold tracking-tight text-right">TRX-{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-4">
                  <span className="text-gray-500">Nominal Transaksi</span>
                  <span className="font-bold text-gray-900 text-lg">Rp 2.500.000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Biaya Admin</span>
                  <span className="font-bold text-[#16a34a]">GRATIS (Eco)</span>
                </div>
              </div>

              <div className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-4 text-left mb-8 shadow-inner">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#16a34a] flex-shrink-0 shadow-sm border border-emerald-50">
                  <Leaf size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-1">Impact Summary</p>
                  <p className="text-sm font-medium text-emerald-800 leading-tight">Selamat! Transaksi ini mendanai <span className="font-bold">5 Bibit Pohon Mangrove</span> untuk ditanam di kawasan pesisir Bali.</p>
                </div>
              </div>

              <Link href="/dashboard" className="w-full">
                <button className="w-full bg-[#115e59] hover:bg-[#064e3b] text-white rounded-xl py-4 font-bold transition-all shadow-md flex items-center justify-center gap-2">
                  Kembali ke Beranda
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
    </>
  );
}
