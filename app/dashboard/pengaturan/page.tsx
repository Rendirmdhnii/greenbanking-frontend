"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  Lock, Globe, BellRing, Shield, LogOut, 
  User, Save, Loader2, CheckCircle, Camera
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useUserContext } from "@/hooks/useUserData";
import Swal from "sweetalert2";
import { SwalGreenBanking } from "@/utils/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function PengaturanPage() {
  const userHook = useUserContext();
  const { userName, userEmail, refreshUserData, avatarUrl, phoneNumber, address } = userHook as any;

  const [activeTab, setActiveTab] = useState("profile");
  const [staticData, setStaticData] = useState<any>(null);
  const [isLoadingStatic, setIsLoadingStatic] = useState(false);

  // Profile Form States
  const [editName, setEditName] = useState(userName || "");
  const [editPhone, setEditPhone] = useState(phoneNumber || "");
  const [editAddress, setEditAddress] = useState(address || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Static Settings Data on mount
  useEffect(() => {
    const fetchStaticData = async () => {
      setIsLoadingStatic(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/settings/static`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStaticData(data);
        }
      } catch (error) {
        console.error("Gagal memuat data statis", error);
      } finally {
        setIsLoadingStatic(false);
      }
    };
    fetchStaticData();
  }, []);

  // Update local state when user data changes
  useEffect(() => {
    setEditName(userName || "");
    setEditPhone(phoneNumber || "");
    setEditAddress(address || "");
    setPreviewImage(avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `http://127.0.0.1:8000${avatarUrl}`) : null);
  }, [userName, avatarUrl, phoneNumber, address]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: 'File Terlalu Besar', text: 'Maksimal ukuran foto adalah 5MB.', ...SwalGreenBanking.error });
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('phone_number', editPhone);
      formData.append('address', editAddress);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await fetch(`${API_URL}/settings/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Omit Content-Type so browser sets it to multipart/form-data with boundary automatically
        },
        body: formData,
      });
      
      if (res.ok) {
        setSaveSuccess(true);
        refreshUserData();
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        const data = await res.json();
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.message || 'Gagal memperbarui profil.', ...SwalGreenBanking.error });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      Swal.fire({ icon: 'error', title: 'Kesalahan Server', text: 'Gagal terhubung ke server.', ...SwalGreenBanking.error });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Edit Profil", icon: <User size={20} /> },
    { id: "security", label: "Keamanan", icon: <Lock size={20} /> },
    { id: "notifications", label: "Notifikasi", icon: <BellRing size={20} /> },
    { id: "privacy", label: "Privasi & Bantuan", icon: <Shield size={20} /> },
    { id: "language", label: "Bahasa", icon: <Globe size={20} /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-4 md:p-8 max-w-6xl mx-auto w-full"
    >
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Pengaturan Akun</h1>
          <p className="text-gray-500 mt-1">Kelola preferensi dan profil EcoBank Anda.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all whitespace-nowrap text-left font-bold text-sm ${
                activeTab === tab.id 
                ? "bg-[#115e59] text-white shadow-md shadow-[#115e59]/20" 
                : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          <div className="hidden md:block w-full h-px bg-gray-200 my-4"></div>
          <button 
            onClick={handleLogout} 
            className="hidden md:flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-600 font-bold hover:bg-red-50 transition-colors text-sm"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* TAB: PROFILE */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Foto Profil</h2>
                    <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full border-4 border-gray-50 bg-gray-100 overflow-hidden relative shadow-inner">
                          {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl">
                              {userName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={28} className="text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#115e59] text-white p-2 rounded-full border-2 border-white shadow-sm">
                          <Camera size={16} />
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">Unggah Foto Baru</p>
                        <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">Mendukung format JPG, PNG, WEBP. Ukuran maksimal 5MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-100"></div>

                  <div className="space-y-5 max-w-xl">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Informasi Dasar</h2>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap (Username)</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115e59]/20 focus:border-[#115e59] outline-none transition-all font-medium text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nomor HP/WhatsApp</label>
                      <input 
                        type="tel" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Contoh: 08123456789"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115e59]/20 focus:border-[#115e59] outline-none transition-all font-medium text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Domisili</label>
                      <textarea 
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Masukkan alamat lengkap"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115e59]/20 focus:border-[#115e59] outline-none transition-all font-medium text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Akun (Terkunci)</label>
                      <input 
                        type="email" 
                        value={userEmail || ""}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full md:w-auto px-8 bg-[#115e59] hover:bg-[#064e3b] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#115e59]/20 disabled:opacity-50"
                      >
                        {saving ? (
                          <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                        ) : saveSuccess ? (
                          <><CheckCircle size={18} /> Tersimpan!</>
                        ) : (
                          <><Save size={18} /> Simpan Profil</>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: SECURITY */}
              {activeTab === "security" && (
                <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-3 text-blue-600 mb-4">
                    <Lock size={28} />
                    <h2 className="text-2xl font-bold text-gray-900">Keamanan Akun</h2>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h3 className="font-bold text-blue-900 mb-2">Autentikasi Dua Faktor (2FA)</h3>
                    <p className="text-sm text-blue-700 mb-4">Lindungi akun Anda dengan menambahkan lapisan keamanan ganda saat login.</p>
                    <button className="bg-white border border-blue-200 text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-sm text-sm">Aktifkan 2FA</button>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900">Ubah PIN Transaksi</h3>
                      <p className="text-sm text-gray-500 mt-1">Perbarui PIN 6 digit Anda secara berkala.</p>
                    </div>
                    <button className="bg-white border border-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shadow-sm text-sm">Ubah PIN</button>
                  </div>
                </motion.div>
              )}

              {/* TAB: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-3 text-emerald-600 mb-4">
                    <BellRing size={28} />
                    <h2 className="text-2xl font-bold text-gray-900">Preferensi Notifikasi</h2>
                  </div>
                  {isLoadingStatic ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-emerald-600" /></div>
                  ) : staticData?.notifications ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                        <div>
                          <p className="font-bold text-gray-900">Promo & Penawaran Email</p>
                          <p className="text-xs text-gray-500">Terima informasi program hijau terbaru.</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${staticData.notifications.options.email_promos ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                          <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${staticData.notifications.options.email_promos ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                        <div>
                          <p className="font-bold text-gray-900">Push Notification Transaksi</p>
                          <p className="text-xs text-gray-500">Pemberitahuan instan saat transfer/donasi.</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${staticData.notifications.options.push_trx ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                          <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${staticData.notifications.options.push_trx ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Gagal memuat preferensi.</p>
                  )}
                </motion.div>
              )}

              {/* TAB: PRIVACY */}
              {activeTab === "privacy" && (
                <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-3 text-purple-600 mb-4">
                    <Shield size={28} />
                    <h2 className="text-2xl font-bold text-gray-900">Privasi & Bantuan</h2>
                  </div>
                  
                  {isLoadingStatic ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-purple-600" /></div>
                  ) : staticData ? (
                    <div className="space-y-6">
                      <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                        <h3 className="font-bold text-purple-900 mb-3">{staticData.privacy_policy?.title}</h3>
                        <p className="text-sm text-purple-800 whitespace-pre-wrap leading-relaxed">
                          {staticData.privacy_policy?.content}
                        </p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4">{staticData.help_center?.title}</h3>
                        <div className="space-y-3">
                          {Object.entries(staticData.help_center?.contacts || {}).map(([key, value]) => (
                            <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                              <span className="font-semibold text-gray-600 text-sm">{key}</span>
                              <span className="text-gray-900 font-medium text-sm">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Gagal memuat data privasi.</p>
                  )}
                </motion.div>
              )}

              {/* TAB: LANGUAGE */}
              {activeTab === "language" && (
                <motion.div key="language" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-3 text-orange-600 mb-4">
                    <Globe size={28} />
                    <h2 className="text-2xl font-bold text-gray-900">Bahasa</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-2 border-orange-500 bg-orange-50 rounded-xl p-4 flex justify-between items-center cursor-pointer">
                      <span className="font-bold text-orange-900">Bahasa Indonesia</span>
                      <CheckCircle className="text-orange-600" size={20} />
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors opacity-50">
                      <span className="font-bold text-gray-600">English (Coming Soon)</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Logout Button */}
          <div className="md:hidden mt-6">
            <button 
              onClick={handleLogout} 
              className="w-full bg-red-50 text-red-600 border border-red-100 py-4 rounded-2xl text-center font-bold text-lg flex justify-center items-center gap-2 active:bg-red-100"
            >
              <LogOut size={22} /> Keluar / Logout
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
