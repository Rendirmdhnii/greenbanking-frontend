"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  ShieldCheck, Users, TrendingUp, ArrowLeft, Wallet, 
  Loader2, RefreshCw, Crown, Mail, LogOut
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface UserItem {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  balance: number;
  joined: string;
}

interface AdminStats {
  total_users: number;
  total_balance: number;
  total_investments: number;
  users: UserItem[];
}

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = "/admin-login";
          return;
        }

        const res = await fetch(`${API_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          localStorage.removeItem('token');
          window.location.href = "/admin-login";
          return;
        }

        const userData = await res.json();
        
        if (userData.is_admin || userData.role === 'admin') {
          setIsAdmin(true);
          setAdminUser(userData);
          fetchStats(token);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, []);

  const fetchStats = async (tokenOverride?: string) => {
    setStatsLoading(true);
    try {
      const token = tokenOverride || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Gagal memuat stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/admin-login";
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#064e3b] mx-auto mb-4" size={32} />
          <p className="text-gray-500 font-medium">Memverifikasi akses Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-lg border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Akses Ditolak</h1>
          <p className="text-gray-500 mb-8">Anda tidak memiliki hak akses Admin. Halaman ini hanya untuk Super Admin.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#064e3b] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#115e59] transition-colors w-full justify-center">
            <ArrowLeft size={18} /> Kembali ke Dashboard
          </Link>
          <button onClick={handleLogout} className="mt-4 text-sm font-bold text-red-500 hover:text-red-600 transition-colors w-full">
            Login dengan Akun Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 rounded-b-[2rem] shadow-sm mb-8 w-full">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#064e3b]">Admin Panel</h1>
                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">SUPER ADMIN</span>
              </div>
              <p className="text-sm text-gray-500">Kelola pengguna dan sistem GreenBanking Nusantara</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchStats()} 
              disabled={statsLoading}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={statsLoading ? 'animate-spin' : ''} /> Refresh Data
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-[#064e3b] to-[#0f766e] rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={24} />
            <h2 className="text-xl font-bold">Selamat datang, {adminUser?.name || 'Super Admin'}!</h2>
          </div>
          <p className="text-emerald-100 leading-relaxed max-w-2xl">
            Anda login sebagai <strong>{adminUser?.email}</strong>.
            Gunakan panel ini untuk mengelola nasabah dan memantau status operasional platform. Modul CRUD Produk dapat ditambahkan di tab terpisah.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Nasabah</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats ? stats.total_users : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Pengguna terdaftar di sistem</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Wallet size={20} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Saldo Platform</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats ? `Rp ${Number(stats.total_balance).toLocaleString('id-ID')}` : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Agregat seluruh wallet nasabah</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Investasi Aktif</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats ? `Rp ${Number(stats.total_investments).toLocaleString('id-ID')}` : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Investasi hijau yang sedang berjalan</p>
          </div>
        </div>

        {/* Daftar Nasabah */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Daftar Seluruh Nasabah</h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              {stats?.users?.length || 0} akun
            </span>
          </div>
          {stats?.users && stats.users.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {stats.users.map((u) => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.is_admin ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-[#115e59]'}`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        {u.is_admin && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md border border-amber-100">
                            <Crown size={10} /> ADMIN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail size={11} />
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">Rp {Number(u.balance).toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Bergabung {u.joined}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-400">
              {statsLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Memuat data nasabah...</span>
                </div>
              ) : (
                <span>Belum ada nasabah terdaftar</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
