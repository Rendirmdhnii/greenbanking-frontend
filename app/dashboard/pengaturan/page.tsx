"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Lock, Globe, BellRing, Shield, ChevronRight, LogOut, 
  User, Phone, MapPin, Save, Loader2, CheckCircle, X
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useUserContext } from "@/hooks/useUserData";
import Swal from "sweetalert2";
import { SwalGreenBanking } from "@/utils/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function PengaturanPage() {
  const userHook = useUserContext();
  const { userName, userEmail, phoneNumber, address, refreshUserData } = userHook;

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editPhone, setEditPhone] = useState(phoneNumber || "");
  const [editAddress, setEditAddress] = useState(address || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: editPhone,
          address: editAddress,
        }),
      });
      
      if (res.ok) {
        setSaveSuccess(true);
        refreshUserData();
        setTimeout(() => {
          setSaveSuccess(false);
          setShowProfileEdit(false);
        }, 1500);
      } else {
        const data = await res.json();
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.message || 'Gagal menyimpan profil', ...SwalGreenBanking.error });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal terhubung ke server.', ...SwalGreenBanking.error });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-8 max-w-4xl mx-auto w-full"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Pengaturan Akun</h1>
          </div>

          {/* Profile Edit Section */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="divide-y divide-gray-100">
              
              {/* Edit Profile — Functional */}
              <button onClick={() => { setShowProfileEdit(!showProfileEdit); setEditPhone(phoneNumber || ""); setEditAddress(address || ""); }} className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors group text-left">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Edit Profil</h3>
                  <p className="text-sm text-gray-500">Ubah Nomor HP dan Alamat Domisili Anda.</p>
                </div>
                <ChevronRight size={20} className={`text-gray-300 group-hover:text-[#115e59] transition-all ${showProfileEdit ? 'rotate-90' : ''}`} />
              </button>

              {/* Profile Edit Form */}
              <AnimatePresence>
                {showProfileEdit && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-gray-50/50 space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Nama (dari Google)</p>
                        <p className="font-semibold text-gray-900">{userName}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email (dari Google)</p>
                        <p className="font-semibold text-gray-900">{userEmail}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          <Phone size={14} className="inline mr-1.5" />Nomor HP / WhatsApp
                        </label>
                        <input 
                          type="tel" 
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx" 
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115e59]/20 focus:border-[#115e59] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          <MapPin size={14} className="inline mr-1.5" />Alamat Domisili
                        </label>
                        <textarea 
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Masukkan alamat lengkap" 
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115e59]/20 focus:border-[#115e59] outline-none transition-all resize-none"
                        />
                      </div>
                      <button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full bg-[#115e59] hover:bg-[#064e3b] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#115e59]/20 disabled:opacity-50"
                      >
                        {saving ? (
                          <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                        ) : saveSuccess ? (
                          <><CheckCircle size={18} /> Tersimpan!</>
                        ) : (
                          <><Save size={18} /> Simpan Perubahan</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={() => Swal.fire({ icon: 'info', title: 'Segera Hadir', text: 'Fitur Keamanan dan 2FA sedang dalam pengembangan.', ...SwalGreenBanking.info })} className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors group text-left">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lock size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Keamanan</h3>
                  <p className="text-sm text-gray-500">Ganti PIN, dan aktifkan Autentikasi Dua Faktor (2FA).</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#115e59] transition-colors" />
              </button>

              <button onClick={() => Swal.fire({ icon: 'info', title: 'Segera Hadir', text: 'Pengaturan Notifikasi akan tersedia dalam update berikutnya.', ...SwalGreenBanking.info })} className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors group text-left">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BellRing size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Notifikasi</h3>
                  <p className="text-sm text-gray-500">Pengaturan Push Notification & Pemberitahuan Email.</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#115e59] transition-colors" />
              </button>

              <button onClick={() => Swal.fire({ icon: 'info', title: 'Kebijakan Privasi', text: 'Kebijakan Privasi dapat diakses pada panel Admin.', ...SwalGreenBanking.info })} className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors group text-left">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Kebijakan Privasi & Bantuan</h3>
                  <p className="text-sm text-gray-500">Link ke dokumen FAQ dan Bantuan Nasabah.</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#115e59] transition-colors" />
              </button>

              <button onClick={() => Swal.fire({ icon: 'info', title: 'Bahasa', text: 'Saat ini hanya tersedia dalam Bahasa Indonesia.', ...SwalGreenBanking.info })} className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors group text-left">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Bahasa</h3>
                  <p className="text-sm text-gray-500">Pilih bahasa aplikasi (Saat ini: Bahasa Indonesia).</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#115e59] transition-colors" />
              </button>

            </div>
          </div>

          <div className="bg-red-50/50 rounded-[2rem] border border-red-100 p-8 text-center flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-red-900 mb-2">Sesi Perangkat Aktif</h3>
            <p className="text-sm text-red-700/80 mb-6 max-w-sm">Pastikan untuk selalu logout ketika menggunakan perangkat publik demi keamanan dana dan akun Anda.</p>
            
            <div className="w-full max-w-xs">
              <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 text-lg active:scale-95 cursor-pointer">
                <LogOut size={22} /> Keluar / Logout
              </button>
            </div>
          </div>

        </motion.div>
    </>
  );
}
