"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useUserData, UserContext } from "@/hooks/useUserData";
import { Loader2, Home, TrendingUp, Receipt, Leaf, User } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userHook = useUserData();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  const mobileNavItems = [
    { name: "Beranda", icon: Home, href: "/dashboard" },
    { name: "Investasi", icon: TrendingUp, href: "/dashboard/investasi" },
    { name: "Tagihan", icon: Receipt, href: "/dashboard/tagihan" },
    { name: "Dampak", icon: Leaf, href: "/dashboard/peringkat" },
    { name: "Akun", icon: User, href: "/dashboard/akun" },
  ];

  // ─── Auth Guard: redirect ke /login jika tidak ada sesi ───
  useEffect(() => {
    if (!userHook.isLoading) {
      const hasToken = !!localStorage.getItem('token');
      const hasSupabase = !!userHook.supabaseUser;
      const hasUserData = !!userHook.userData;

      if (!hasToken && !hasSupabase && !hasUserData) {
        // Tidak ada sesi sama sekali → redirect ke login
        window.location.href = "/login";
        return;
      }
      setAuthChecked(true);
    }
  }, [userHook.isLoading, userHook.supabaseUser, userHook.userData]);

  if (userHook.isLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <img src="/logo.svg" alt="GreenBanking Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-3 text-[#064e3b]">
            <Loader2 className="animate-spin" size={20} />
            <span className="font-medium">Menyinkronkan data akun...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={userHook}>
      <div className="min-h-screen bg-[#f4f7f6] flex font-sans selection:bg-emerald-200 selection:text-emerald-900 pb-24 md:pb-0">
        <Sidebar userHook={userHook} />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-24 md:pb-0">
          <Header userHook={userHook} />
          {children}
        </main>

        {/* Floating Glassmorphic Bottom Navigation Bar for Mobile */}
        <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-md border border-gray-100/80 shadow-xl rounded-2xl h-16 flex items-center justify-around px-2 font-sans transition-all duration-300">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
                  isActive ? "text-[#059669]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <item.icon size={19} className={`transition-transform duration-200 ${isActive ? "scale-110 text-[#059669]" : "text-gray-400"}`} />
                <span className="text-[10px] font-bold mt-1 tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </UserContext.Provider>
  );
}
