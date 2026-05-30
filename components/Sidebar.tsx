// FORCE TRIGGER DEPLOYMENT VER MARET 2026 - REVISI UAS FIX FINAL
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Leaf, User, Settings, ShieldCheck, LogOut, Receipt } from "lucide-react";
import { supabase } from "@/utils/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface SidebarProps {
  userHook?: any;
  activeMenu?: string;
}

export default function Sidebar({ userHook, activeMenu }: SidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin =
    userHook?.role === "super_admin" ||
    userHook?.userData?.role === "super_admin";
  const isAdmin =
    !!userHook?.isAdmin ||
    isSuperAdmin ||
    userHook?.userData?.is_admin;
  const adminHref = isSuperAdmin ? "/super-admin/dashboard" : "/dashboard/admin";

  const handleLogout = async () => {
    try {
      // 1. Revoke Sanctum token di server
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
      }
    } catch (e) {
      console.error('Server logout error:', e);
    } finally {
      // 2. Hapus token di client
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      // 3. Logout Supabase (Google)
      await supabase.auth.signOut();
      // 4. Redirect ke login
      window.location.href = "/login";
    }
  };

  // Middle menu items specified by user
  const navItems = [
    { name: "Beranda", icon: Home, href: "/dashboard" },
    { name: "Investasi", icon: TrendingUp, href: "/dashboard/investasi" },
    { name: "Tagihan", icon: Receipt, href: "/dashboard/tagihan" },
    { name: "Dampak", icon: Leaf, href: "/dashboard/peringkat" },
    { name: "Akun", icon: User, href: "/dashboard/akun" },
    { name: "Pengaturan", icon: Settings, href: "/dashboard/pengaturan" },
  ];

  return (
    <aside className="w-66 bg-white border-r border-gray-150 flex flex-col justify-between hidden md:flex h-screen sticky top-0 font-sans z-30 shadow-sm shadow-gray-150/20">
      
      {/* Top Part: Logo and Header */}
      <div>
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 border border-emerald-100/50 shadow-sm">
              <img src="/logo.svg" alt="GreenBanking Logo" className="w-6.5 h-6.5 object-contain" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-emerald-950">
              Green<span className="text-[#059669]">Banking</span>
            </span>
          </Link>
        </div>

        {/* Middle Part: Navigation Menus */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            // Determine active menu item by pathname or custom activeMenu prop
            const isActive = activeMenu 
              ? activeMenu.toLowerCase() === item.name.toLowerCase() 
              : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`group flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 relative ${
                  isActive 
                    ? "bg-emerald-50/80 text-[#059669] shadow-sm shadow-emerald-500/5" 
                    : "text-gray-500 hover:bg-gray-50/80 hover:text-gray-900"
                }`}
              >
                {/* Active Indicator Accent Line */}
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#059669] rounded-r-full" />
                )}
                
                <item.icon size={19} className={`transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-[#059669]" : "text-gray-400 group-hover:text-gray-600"}`} /> 
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Admin Panel Access Link (Preserved safely) */}
          {isAdmin && (
            <Link 
              href={adminHref} 
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 border border-amber-100 bg-amber-50/50 ${
                pathname === adminHref 
                  ? "bg-amber-100/80 text-amber-800 shadow-sm" 
                  : "text-amber-700 hover:bg-amber-100 hover:text-amber-900"
              }`}
            >
              <ShieldCheck size={19} className="text-amber-500 transition-transform group-hover:scale-105" /> 
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom Part: Logout Button */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={19} className="text-red-500 transition-transform group-hover:translate-x-0.5" />
          <span>Keluar Akun</span>
        </button>
      </div>

    </aside>
  );
}
