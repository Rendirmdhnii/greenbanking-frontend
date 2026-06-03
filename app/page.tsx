"use client";

import { Navbar, Footer, ServiceCard } from "@/components/landing";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, Leaf } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#064e3b]/80 z-10" />
          {/* using vertical pine forest image */}
          <img 
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80" 
            alt="Hutan Pinus Vertikal" 
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-8 md:mb-6 px-2 sm:px-4 tracking-tight leading-tight"
          >
            Lebih dari Sekadar Bank. <br/> Ini Green Banking.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-emerald-50 mb-12 md:mb-10 px-4 sm:px-6 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Kembangkan aset finansial Anda sekaligus kurangi jejak karbon. EcoBank Nusantara menghadirkan layanan perbankan digital modern yang peduli pada bumi.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a href="/login" className="inline-block bg-[#115e59] hover:bg-[#064e3b] text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl border border-[#115e59]">
              Mulai Sekarang
            </a>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-24 bg-[#f4f7f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-sm font-bold tracking-widest text-[#115e59] uppercase mb-3">Tentang Kami</h2>
              <h3 className="text-4xl lg:text-5xl font-bold text-[#064e3b] mb-6 leading-tight">Perbankan Berkelanjutan</h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Kami adalah pelopor perbankan hijau di Indonesia yang memadukan teknologi finansial modern dengan komitmen kuat pada kelestarian lingkungan. Setiap transaksi Anda berkontribusi pada program reforestasi dan energi terbarukan.
              </p>
              <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-sm w-max border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-[#115e59]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#064e3b]">Transparansi ESG</h4>
                  <p className="text-sm text-gray-500">Laporan dampak lingkungan real-time</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative h-[400px] sm:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80" 
                  alt="Tunas tumbuh" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/80 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-[#115e59]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Investasi Hijau</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#064e3b]">Rp 2.4T</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="layanan" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#115e59] uppercase mb-3">Layanan Kami</h2>
            <h3 className="text-4xl font-bold text-[#064e3b] mb-6 tracking-tight">Solusi Finansial Ramah Lingkungan</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard 
              delay={0.1}
              icon={<Wallet className="w-8 h-8 text-[#115e59]" />}
              iconBgColor="bg-emerald-50"
              title="Eco-Wallet"
              description="Dompet digital cerdas yang menghitung jejak karbon dari setiap pembelanjaan Anda secara real-time."
            />
            <ServiceCard 
              delay={0.2}
              icon={<TrendingUp className="w-8 h-8 text-[#115e59]" />}
              iconBgColor="bg-emerald-50"
              title="Green Investments"
              description="Investasikan dana Anda pada proyek-proyek energi terbarukan dan bisnis berkelanjutan yang telah terkurasi."
            />
            <ServiceCard 
              delay={0.3}
              icon={<Leaf className="w-8 h-8 text-[#115e59]" />}
              iconBgColor="bg-emerald-50"
              title="Carbon Offset"
              description="Tukarkan poin transaksi Anda langsung dengan penanaman pohon atau kredit karbon bersertifikat."
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}