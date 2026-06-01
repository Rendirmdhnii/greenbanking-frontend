// FORCE TRIGGER DEPLOYMENT VER MARET 2026 - REVISI UAS FIX FINAL
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  User, ShieldCheck, MapPin, Mail, Phone, Camera, Globe, Target, CreditCard, Eye, EyeOff
} from "lucide-react";
import { useUserContext } from "@/hooks/useUserData";
import { useState } from "react";

export default function AkunPage() {
  const userHook = useUserContext();
  const { userName, userEmail, avatarUrl, initials, tier, userEcoPoints, impactScore, phoneNumber, address, accountNumber, isOwner, totalMangrove } = userHook;
  const [showSensitive, setShowSensitive] = useState(false);

  // Mask sensitive data for non-owner users
  const maskData = (data: string) => {
    if (isOwner || showSensitive) return data;
    if (!data || data === '-' || data === 'Belum diatur') return data;
    if (data.includes('@')) {
      const [local, domain] = data.split('@');
      return local.substring(0, 2) + '***@' + domain;
    }
    if (data.length > 4) {
      return data.substring(0, 3) + '****' + data.substring(data.length - 2);
    }
    return '****';
  };

  const maskAccountNumber = (num: string) => {
    if (isOwner || showSensitive) return num;
    if (!num) return '-';
    return num.substring(0, 4) + '****' + num.substring(num.length - 2);
  };

  return (
    <>
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-8 max-w-5xl mx-auto w-full"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#064e3b]">Profil Nasabah</h1>
            {!isOwner && (
              <button 
                onClick={() => setShowSensitive(!showSensitive)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {showSensitive ? <EyeOff size={16} /> : <Eye size={16} />}
                {showSensitive ? 'Sembunyikan Data' : 'Tampilkan Data'}
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-[#064e3b] to-[#115e59] relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                </div>
                
                <div className="px-8 pb-8 relative">
                  <div className="relative -mt-16 mb-4 flex justify-between items-end">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#064e3b] to-[#115e59]">
                        {avatarUrl ? (
                          <img src={`${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}t=${Date.now()}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-4xl tracking-widest">{initials}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-sm ${
                        tier === 'Prioritas' 
                          ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900' 
                          : tier === 'Platinum' 
                            ? 'bg-gradient-to-r from-gray-200 to-gray-400 text-gray-900'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        <ShieldCheck size={12} /> {tier} Tier
                      </span>
                    </div>
                    <p className="text-gray-500 font-medium mb-6 flex items-center gap-2">
                      <User size={16} /> Nasabah {tier}
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm"><CreditCard size={16}/></div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Nomor Rekening</p>
                          <p className="font-semibold text-gray-900 text-sm font-mono">{maskAccountNumber(accountNumber)}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm"><Mail size={16}/></div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Email Terdaftar</p>
                          <p className="font-semibold text-gray-900 text-sm truncate">{maskData(userEmail)}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm"><Phone size={16}/></div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Nomor HP / WhatsApp</p>
                          <p className="font-semibold text-gray-900 text-sm">{maskData(phoneNumber || "-")}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm"><MapPin size={16}/></div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Alamat Domisili</p>
                          <p className="font-semibold text-gray-900 text-sm">{maskData(address || "Belum diatur")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#064e3b] text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#115e59] rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#a3e635]/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <h3 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">
                  <Globe size={24} className="text-emerald-300" /> Total Dampak Lingkungan
                </h3>

                <div className="flex-1 space-y-6 relative z-10">
                  <div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Pohon Ditanam</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold">{totalMangrove}</span>
                      <span className="text-emerald-300 pb-1 font-medium">Bibit Mangrove</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10"></div>

                  <div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Jejak Karbon Dihapus</p>
                    <div className="flex items-end gap-2">
                      {/* FORMATTING ANGKA DINAMIS SESUAI SPESIFIKASI */}
                      <span className="text-4xl font-bold">
                        {Number(impactScore).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-emerald-300 pb-1 font-medium">kg CO2e</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10"></div>

                  <div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Poin Eco</p>
                    <div className="flex items-end gap-2">
                      <Target size={32} className="text-[#a3e635]" />
                      <span className="text-3xl font-bold">{userEcoPoints}</span>
                      <span className="text-emerald-300 pb-1 font-medium ml-1">Poin</span>
                    </div>
                  </div>
                </div>

                <Link href="/dashboard/peringkat" className="mt-8 relative z-10 block text-center w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors text-sm border border-white/20 backdrop-blur-sm">
                  Lihat Detail Peringkat
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
    </>
  );
}
