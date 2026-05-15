"use client";

import Link from "next/link";
import { Search, Bell, ShieldCheck, Leaf, X, Wrench, Sparkles, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string; // 'maintenance' | 'update' | 'info'
  read: boolean;
  created_at: string;
}

export default function Header({ userHook }: { userHook: any }) {
  const { isAdmin, avatarUrl, initials, userEcoPoints, impactScore } = userHook;
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const menuItems = [
    { name: "Transfer", href: "/dashboard/transfer" },
    { name: "Investasi", href: "/dashboard/investasi" },
    { name: "Donasi", href: "/dashboard/donasi" },
    { name: "Riwayat", href: "/dashboard/riwayat" },
    { name: "Pengaturan", href: "/dashboard/pengaturan" },
    { name: "Profil Akun", href: "/dashboard/akun" },
    { name: "Pembayaran", href: "/dashboard/pembayaran" },
    { name: "QRIS", href: "/dashboard/qris" },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSelect = (href: string) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    router.push(href);
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (e) {
        // Fallback notifications if API unavailable
        setNotifications([
          { id: 1, title: 'Maintenance Terjadwal', message: 'Sistem akan mengalami maintenance pada 20 Mei 2026.', type: 'maintenance', read: false, created_at: new Date().toISOString() },
          { id: 2, title: 'Fitur Baru Tersedia', message: 'QRIS & Donasi kini aktif di dashboard Anda.', type: 'update', read: false, created_at: new Date().toISOString() },
        ]);
      }
    };
    fetchNotifications();
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Wrench size={14} className="text-amber-600" />;
      case 'update': return <Sparkles size={14} className="text-blue-600" />;
      default: return <Info size={14} className="text-emerald-600" />;
    }
  };

  const getNotifBg = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-amber-50 border-amber-100';
      case 'update': return 'bg-blue-50 border-blue-100';
      default: return 'bg-emerald-50 border-emerald-100';
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Baru saja';
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Cari transaksi atau fitur..." 
          className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#115e59]/20 outline-none" 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchDropdown(true);
          }}
          onFocus={() => setShowSearchDropdown(true)}
          onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
        />
        {showSearchDropdown && searchQuery && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {filteredMenu.length > 0 ? (
              filteredMenu.map((item, idx) => (
                <button
                  key={idx}
                  onMouseDown={() => handleSearchSelect(item.href)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                >
                  {item.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">Tidak ditemukan</div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-6">
        {isAdmin && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 rounded-full border border-amber-200">
            <ShieldCheck size={14} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700">Super Admin</span>
          </div>
        )}
        <Link href="/dashboard/peringkat" className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer">
          <Leaf size={16} className="text-[#115e59]" />
          <span className="text-sm font-bold text-[#064e3b]">Skor Dampak: {impactScore || 0}</span>
        </Link>

        {/* Notification Bell — Functional */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
            className="relative text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-white text-[8px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h4 className="font-bold text-gray-900 text-sm">Notifikasi</h4>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">Tidak ada notifikasi</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`px-5 py-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${getNotifBg(n.type)}`}>
                          {getNotifIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-medium">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/dashboard/akun" className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center cursor-pointer bg-gradient-to-br from-[#064e3b] to-[#115e59]">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-sm tracking-widest">{initials}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
