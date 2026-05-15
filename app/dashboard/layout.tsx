"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useUserData, UserContext } from "@/hooks/useUserData";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userHook = useUserData();
  const [authChecked, setAuthChecked] = useState(false);

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
      <div className="min-h-screen bg-[#f4f7f6] flex font-sans selection:bg-emerald-200 selection:text-emerald-900">
        <Sidebar userHook={userHook} />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          <Header userHook={userHook} />
          {children}
        </main>
      </div>
    </UserContext.Provider>
  );
}
