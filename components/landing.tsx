"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Ikon Logo Kustom Green Banking */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20 text-white font-bold text-xl transition-transform group-hover:scale-105">
              🌿
            </div>
            {/* Teks Branding Nama Bank */}
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">EcoBank</span>
              <span className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase -mt-1">Nusantara</span>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-[#115e59] transition-colors font-medium">Beranda</Link>
            <Link href="#layanan" className="text-gray-600 hover:text-[#115e59] transition-colors font-medium">Layanan</Link>
            <Link href="#tentang" className="text-gray-600 hover:text-[#115e59] transition-colors font-medium">Tentang</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-[#115e59] hover:text-[#064e3b] font-semibold transition-colors">
              Masuk
            </Link>
            <Link href="/login" className="bg-[#064e3b] hover:bg-[#115e59] text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg">
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#f4f7f6] pt-16 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-12">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Diawasi Oleh</h3>
          <div className="flex space-x-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="font-bold text-2xl text-gray-700 tracking-tighter">OJK</div>
            <div className="font-bold text-xl text-gray-700 tracking-tight">BANK INDONESIA</div>
            <div className="font-bold text-2xl text-gray-700 tracking-tighter">LPS</div>
          </div>
        </div>
        
        <div className="border-t border-gray-200/60 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Green Banking Indonesia. Hak Cipta Dilindungi.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-[#115e59] transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-[#115e59] transition-colors">Syarat Ketentuan</Link>
            <Link href="#" className="hover:text-[#115e59] transition-colors">Keamanan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  delay?: number;
}

export function ServiceCard({ icon, title, description, iconBgColor = "bg-emerald-50", delay = 0 }: ServiceCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_-4px_rgba(17,94,89,0.1)] transition-all duration-300 group"
    >
      <div className={`${iconBgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#064e3b] mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{description}</p>
    </motion.div>
  );
}