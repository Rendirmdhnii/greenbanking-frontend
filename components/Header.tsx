"use client";

import Link from "next/link";
import { Search, Bell, ShieldCheck, Leaf, X, Wrench, Sparkles, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string; // 'maintenance' | 'update' | 'info'
  read: boolean;
  is_read?: boolean;
  created_at: string;
}

export default function Header({ userHook }: { userHook: any }) {
  const { isAdmin, avatarUrl, initials, userEcoPoints, impactScore } = userHook;
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const shownNotifIdsRef = useRef<Set<number>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [currentUserScore, setCurrentUserScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserScore = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_URL}/impact-leaderboard`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCurrentUserScore(data.current_user_score ?? 0);
          }
        }
      } catch (e) {
        console.error("Gagal mengambil skor dampak user:", e);
      }
    };
    fetchUserScore();
  }, []);

  const menuItems = [
    { name: "Transfer", href: "/dashboard/transfer" },
    { name: "Investasi", href: "/dashboard/investasi" },
    { name: "Donasi", href: "/dashboard/donasi" },
    { name: "Riwayat", href: "/dashboard/riwayat" },
    { name: "Pengaturan", href: "/dashboard/pengaturan" },
    { name: "Profil Akun", href: "/dashboard/akun" },
    { name: "Pembayaran", href: "/dashboard/tagihan" },
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
          const list = data.notifications || [];
          setNotifications(list);

          // Auto-Toast logic for unread notifications not shown in this session
          const newUnread = list.filter((n: Notification) => (!n.read && !n.is_read) && !shownNotifIdsRef.current.has(n.id));
          if (newUnread.length > 0) {
            const nextNotif = newUnread[0];
            // Mark all found as shown in session
            newUnread.forEach((n: Notification) => shownNotifIdsRef.current.add(n.id));
            setActiveToast(nextNotif);
          }
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
    // Poll notifications every 10 seconds for real-time feel
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Close notifications and search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read && !n.is_read).length;

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

  const handleNotifClick = async (notifId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/notifications/${notifId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true, is_read: true } : n));
      }
    } catch (e) {
      console.error("Gagal tandai dibaca:", e);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, is_read: true })));
      }
    } catch (e) {
      console.error("Gagal tandai semua dibaca:", e);
    }
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
    <>
      <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:pl-8 md:pr-12 sticky top-0 z-30">
        {/* Left Side: Search Bar */}
        <div className="relative w-32 xs:w-40 sm:w-48 md:w-96 flex-shrink-0" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari transaksi atau fitur..." 
            className="w-full bg-gray-50 border-none rounded-full py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-[#115e59]/20 outline-none" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
          />
          {showSearchDropdown && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
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

        {/* Right Side: Notification Icon & Profile Avatar */}
        <div className="flex items-center gap-2 xs:gap-3 md:gap-6">
          {isAdmin && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-yellow-50 px-2 py-1 rounded-full border border-amber-200 flex-shrink-0">
              <ShieldCheck size={12} className="text-amber-600" />
              <span className="text-[10px] sm:text-xs font-bold text-amber-700">Super Admin</span>
            </div>
          )}
          <Link href="/dashboard/peringkat" className="flex items-center gap-1 sm:gap-2 bg-emerald-50 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer flex-shrink-0">
            <Leaf size={14} className="text-[#115e59] flex-shrink-0" />
            <span className="text-[10px] sm:text-sm font-bold text-[#064e3b] whitespace-nowrap">
              Skor Dampak: {currentUserScore !== null 
                ? new Intl.NumberFormat('id-ID').format(Math.floor(currentUserScore)) 
                : new Intl.NumberFormat('id-ID').format(Math.floor(impactScore || 0))}
            </span>
          </Link>

          {/* Notification Lonceng Dropdown */}
          <div className="relative flex-shrink-0" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all cursor-pointer relative hover:scale-105 border border-gray-100 bg-white"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                {/* Notification Header */}
                <div className="px-3 py-2.5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <span className="font-bold text-gray-900 text-sm">Notifikasi Baru</span>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs font-bold text-[#115e59] hover:underline">
                        Tandai Semua Dibaca
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  </div>
                </div>
 
                {/* Notification Body */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center text-gray-400 text-xs">Tidak ada notifikasi</div>
                  ) : (
                    notifications.map(n => {
                      const isUnread = !n.read && !n.is_read;
                      return (
                        <div 
                           key={n.id} 
                          onClick={() => handleNotifClick(n.id)}
                          className={`px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${isUnread ? 'bg-emerald-50/10 hover:bg-emerald-50/20 border-l-2 border-emerald-500' : ''}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${getNotifBg(n.type)}`}>
                              {getNotifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{n.title}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">{n.message}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5 font-medium">{timeAgo(n.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <Link href="/dashboard/akun" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center cursor-pointer bg-gradient-to-br from-[#064e3b] to-[#115e59] flex-shrink-0">
            {avatarUrl ? (
              <img src={`${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}t=${Date.now()}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xs sm:text-sm tracking-widest">{initials}</span>
            )}
          </Link>
        </div>
      </header>

      {/* Auto-Toast Notification Container */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[100] w-[90%] max-w-sm bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 flex gap-3 items-start font-sans"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${getNotifBg(activeToast.type)}`}>
              {getNotifIcon(activeToast.type)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-gray-900 truncate">{activeToast.title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 self-start mt-0.5">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
