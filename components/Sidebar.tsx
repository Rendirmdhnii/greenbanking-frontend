"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Leaf, User, Settings, ShieldCheck, LogOut, Receipt } from "lucide-react";
import { supabase } from "@/utils/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function Sidebar({ userHook }: { userHook: any }) {
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

  const navItems = [
    { name: "Beranda", icon: Home, href: "/dashboard" },
    { name: "Investasi", icon: TrendingUp, href: "/dashboard/investasi" },
    { name: "Tagihan", icon: Receipt, href: "/dashboard/tagihan" },
    { name: "Dampak", icon: Leaf, href: "/dashboard/peringkat" },
    { name: "Akun", icon: User, href: "/dashboard/akun" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="h-20 flex items-center px-6 border-b border-emerald-800/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {/* Pertahankan komponen ikon daun bulat hijau yang sudah sukses */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md text-white font-bold text-xl transition-transform group-hover:scale-105">
              🍃
            </div>
            {/* Kembalikan Nama Asli Proyek: GreenBanking */}
            <span className="font-extrabold text-2xl tracking-tight text-emerald-900">
              Green<span className="text-emerald-600">Banking</span>
            </span>
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive ? "bg-emerald-50 text-[#115e59]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={20} /> {item.name}
              </Link>
            )
          })}
          {isAdmin && (
            <Link href={adminHref} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors border border-amber-100 ${
              pathname === adminHref ? "bg-amber-100 text-amber-700" : "text-amber-600 bg-amber-50 hover:bg-amber-100"
            }`}>
              <ShieldCheck size={20} /> Admin Panel
            </Link>
          )}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-50 space-y-2">
        <Link href="/dashboard/pengaturan" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
          pathname === '/dashboard/pengaturan' ? "bg-emerald-50 text-[#115e59]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}>
          <Settings size={20} /> Pengaturan
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors">
          <LogOut size={20} /> Keluar
        </button>
      </div>
    </aside>
  );
}
