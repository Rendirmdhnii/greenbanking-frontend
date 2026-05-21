"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  ShieldCheck, Users, TrendingUp, ArrowLeft, Wallet,
  Loader2, RefreshCw, Crown, Mail, LogOut
} from "lucide-react";
import Swal from "sweetalert2";
import { globalProjectImages, fallbackImage } from "@/utils/projectImages";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface UserItem {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  balance: number;
  joined: string;
}

interface GreenProduct {
  id: number;
  product_id: string;
  category: string;
  title: string;
  image: string | null;
  target_funding: number;
  min_amount: number;
  description?: string;
  interest_rate?: number | null;
  days_left?: number | null;
}

interface AdminStats {
  total_users: number;
  total_balance: number;
  total_investments: number;
  users: UserItem[];
  products: GreenProduct[];
}

interface AdminTransaction {
  id?: number | string;
  amount?: number | string;
  status?: string;
  reference?: string;
  created_at?: string;
  user?: {
    id?: number | string;
    name?: string;
    email?: string;
    phone?: string;
  };
  user_name?: string;
  user_email?: string;
}

export default function SuperAdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          window.location.href = "/super-admin/login";
          return;
        }

        const res = await fetch(`${API_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          localStorage.removeItem('admin_token');
          window.location.href = "/super-admin/login";
          return;
        }

        const userData = await res.json();
        
        if (userData.is_admin || userData.role === 'super_admin' || userData.role === 'admin') {
          setIsAdmin(true);
          setAdminUser(userData);
          fetchStats(token);
          fetchTransactions(token);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Kesalahan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, []);

  const fetchStats = async (tokenOverride?: string) => {
    setStatsLoading(true);
    try {
      const token = tokenOverride || localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        
        // Fetch products too
        const prodRes = await fetch(`${API_URL}/admin/products`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const prodData = await prodRes.json();
        
        setStats({ ...data, products: prodData.products });
      }
    } catch (error) {
      console.error("Gagal memuat stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTransactions = async (tokenOverride?: string) => {
    setTransactionsLoading(true);
    try {
      const token = tokenOverride || localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/transactions?limit=50`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || data?.transactions || [];
        setTransactions(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error("Gagal memuat transaksi:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const getBadgeStatus = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("success") || normalized.includes("paid") || normalized.includes("settlement") || normalized === "berhasil") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
    if (normalized.includes("pending") || normalized.includes("process") || normalized === "menunggu pembayaran") {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    if (normalized.includes("fail") || normalized.includes("deny") || normalized.includes("expire") || normalized.includes("cancel") || normalized === "gagal") {
      return "bg-rose-100 text-rose-700 border-rose-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getIndonesianStatus = (status?: string): string => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("success") || normalized.includes("paid") || normalized.includes("settlement") || normalized === "berhasil") {
      return "Berhasil";
    }
    if (normalized.includes("pending") || normalized.includes("process") || normalized === "menunggu pembayaran") {
      return "Menunggu Pembayaran";
    }
    if (normalized.includes("fail") || normalized.includes("deny") || normalized.includes("expire") || normalized.includes("cancel") || normalized === "gagal") {
      return "Gagal";
    }
    return status || "Tidak Diketahui";
  };

  const formatTanggal = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
  };

  const formatRupiah = (value?: number | string) => {
    const n = typeof value === "string" ? Number(value) : value;
    const safe = Number.isFinite(Number(n)) ? Number(n) : 0;
    return `Rp ${safe.toLocaleString("id-ID")}`;
  };

  const handleAdjustBalance = async (user: UserItem) => {
    const { value: newBalance } = await Swal.fire({
      title: `Ubah Saldo: ${user.name}`,
      input: 'number',
      inputLabel: 'Masukkan Saldo Baru (Rp)',
      inputValue: user.balance,
      showCancelButton: true,
      background: '#ffffff',
      color: '#111827',
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
    });

    if (newBalance) {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_URL}/admin/users/${user.id}/balance`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ balance: newBalance })
        });

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: `Saldo ${user.name} berhasil diubah.`,
            background: '#ffffff',
            color: '#111827',
            confirmButtonColor: '#059669'
          });
          fetchStats(); // Muat ulang data
        } else {
          Swal.fire('Kesalahan', 'Gagal mengubah saldo', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Kesalahan', 'Terjadi kesalahan sistem', 'error');
      }
    }
  };

  const handleTambahProduk = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Tambah Produk Investasi/Donasi",
      width: "700px",
      html: `
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Judul Produk</div>
            <input id="swal-title" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" placeholder="Contoh: Rehabilitasi Mangrove">
          </div>
          <div class="col-span-2 hidden">
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">URL Gambar (Terunci Otomatis)</div>
            <input id="swal-image" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" disabled>
          </div>
          <div class="col-span-2">
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Deskripsi (opsional)</div>
            <textarea id="swal-desc" class="swal2-textarea !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" style="min-height: 90px;" placeholder="Tuliskan ringkasan proyek..."></textarea>
          </div>
          <div>
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Kategori</div>
            <input id="swal-category" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" placeholder="Contoh: Restorasi">
          </div>
          <div>
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Minimal Invest/Donasi (Rp)</div>
            <input id="swal-min" type="number" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" value="10000">
          </div>
          <div>
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Target Dana (Rp)</div>
            <input id="swal-target" type="number" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" value="0">
          </div>
          <div>
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Bunga / ROI (%) (opsional)</div>
            <input id="swal-roi" type="number" step="0.1" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" value="0">
          </div>
          <div>
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Hari Tersisa (opsional)</div>
            <input id="swal-days" type="number" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" value="0">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      background: "#ffffff",
      color: "#111827",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#dc2626",
      preConfirm: () => {
        const title = (document.getElementById("swal-title") as HTMLInputElement).value;
        const category = (document.getElementById("swal-category") as HTMLInputElement).value;
        if (!title.trim() || !category.trim()) {
          Swal.showValidationMessage("Judul dan kategori wajib diisi.");
          return null;
        }
        return {
          title,
          category,
          image: globalProjectImages[title] || fallbackImage,
          description: (document.getElementById("swal-desc") as HTMLTextAreaElement).value,
          target_funding: Number((document.getElementById("swal-target") as HTMLInputElement).value),
          min_amount: Number((document.getElementById("swal-min") as HTMLInputElement).value),
          interest_rate: Number((document.getElementById("swal-roi") as HTMLInputElement).value),
          days_left: Number((document.getElementById("swal-days") as HTMLInputElement).value),
        };
      },
    });

    if (formValues) {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_URL}/admin/products`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formValues),
        });

        if (res.ok) {
          await Swal.fire({
            icon: "success",
            title: "Produk berhasil ditambahkan",
            background: "#ffffff",
            color: "#111827",
            confirmButtonColor: "#059669",
          });
          fetchStats();
        } else {
          const data = await res.json().catch(() => ({}));
          Swal.fire("Kesalahan", data?.message || data?.error || "Gagal menambahkan produk", "error");
        }
      } catch {
        Swal.fire("Kesalahan", "Terjadi kesalahan sistem", "error");
      }
    }
  };

  const handleHapusProduk = async (product: GreenProduct) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus produk ini?",
      text: `Produk: ${product.title}`,
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/products/${product.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Produk berhasil dihapus",
          background: "#ffffff",
          color: "#111827",
          confirmButtonColor: "#059669",
        });
        fetchStats();
      } else {
        Swal.fire("Kesalahan", "Gagal menghapus produk", "error");
      }
    } catch {
      Swal.fire("Kesalahan", "Terjadi kesalahan sistem", "error");
    }
  };

  const handleEditProduct = async (product: GreenProduct) => {
    const { value: formValues } = await Swal.fire({
      title: `Ubah Produk: ${product.title}`,
      width: '600px',
      html: `
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Judul Produk</div>
            <input id="swal-title" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" value="${product.title}">
          </div>
          <div class="col-span-2 hidden">
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">URL Gambar (Terunci Otomatis)</div>
            <input id="swal-image" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" disabled value="${product.image || ''}">
          </div>
          <div class="col-span-2">
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Deskripsi</div>
            <textarea id="swal-desc" class="swal2-textarea !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" style="min-height: 80px;">${product.description || ''}</textarea>
          </div>
          <div>
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Target Dana (Rp)</div>
            <input id="swal-target" type="number" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" value="${product.target_funding || 0}">
          </div>
          <div>
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Minimal Invest/Donasi (Rp)</div>
            <input id="swal-min" type="number" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" value="${product.min_amount || 0}">
          </div>
          <div>
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Bunga / ROI (%)</div>
            <input id="swal-roi" type="number" step="0.1" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" value="${product.interest_rate || 0}">
          </div>
          <div>
            <div class="text-left mb-1 text-sm text-gray-700 font-bold">Hari Tersisa</div>
            <input id="swal-days" type="number" class="swal2-input !mt-0 !mb-2 w-full bg-gray-50 border-gray-300 text-gray-900" value="${product.days_left || 0}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      background: '#ffffff',
      color: '#111827',
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        return {
          title,
          image: globalProjectImages[title] || product.image || fallbackImage,
          description: (document.getElementById('swal-desc') as HTMLTextAreaElement).value,
          target_funding: Number((document.getElementById('swal-target') as HTMLInputElement).value),
          min_amount: Number((document.getElementById('swal-min') as HTMLInputElement).value),
          interest_rate: Number((document.getElementById('swal-roi') as HTMLInputElement).value),
          days_left: Number((document.getElementById('swal-days') as HTMLInputElement).value),
        };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_URL}/admin/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formValues)
        });

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Produk Diperbarui',
            background: '#ffffff',
            color: '#111827',
            confirmButtonColor: '#059669'
          });
          fetchStats();
        } else {
          Swal.fire('Kesalahan', 'Gagal memperbarui produk', 'error');
        }
      } catch (error) {
        Swal.fire('Kesalahan', 'Terjadi kesalahan sistem', 'error');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = "/super-admin/login";
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={32} />
          <p className="text-emerald-700 font-medium">Memverifikasi Akses Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Akses Ditolak</h1>
          <p className="text-gray-500 mb-8">Anda tidak memiliki hak akses. Halaman ini hanya untuk Admin.</p>
          <button onClick={handleLogout} className="mt-4 text-sm font-bold text-red-500 hover:text-red-600 transition-colors w-full border border-red-200 py-3 rounded-xl hover:bg-red-50">
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm mb-8 w-full sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 tracking-wider">SUPER ADMIN</span>
              </div>
              <p className="text-sm text-gray-500">Pusat Kendali GreenBanking Nusantara</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { fetchStats(); fetchTransactions(); }}
              disabled={statsLoading}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={statsLoading ? 'animate-spin text-emerald-600' : 'text-emerald-600'} /> Sinkronkan Data
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 border border-emerald-600 rounded-2xl p-8 text-white mb-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <ShieldCheck size={28} className="text-emerald-300" />
            <h2 className="text-2xl font-bold tracking-tight">Selamat Datang, {adminUser?.name || 'Admin'}!</h2>
          </div>
          <p className="text-emerald-100 leading-relaxed max-w-2xl text-sm relative z-10">
            Login sebagai <strong>{adminUser?.email}</strong>.
            Anda memiliki akses penuh untuk mengelola pengguna, memantau statistik platform, dan mengelola katalog produk investasi/donasi.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Nasabah</span>
            </div>
            <p className="text-4xl font-black text-gray-900">
              {stats ? stats.total_users : '—'}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                <Wallet size={20} className="text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Saldo Beredar</span>
            </div>
            <p className="text-4xl font-black text-gray-900 tracking-tight">
              {stats ? `Rp ${Number(stats.total_balance).toLocaleString('id-ID')}` : '—'}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Investasi Aktif</span>
            </div>
            <p className="text-4xl font-black text-gray-900 tracking-tight">
              {stats ? `Rp ${Number(stats.total_investments).toLocaleString('id-ID')}` : '—'}
            </p>
          </div>
        </div>

        {/* Daftar Nasabah */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Database Nasabah</h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
              {stats?.users?.length || 0} PENGGUNA
            </span>
          </div>
          {stats?.users && stats.users.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.users.map((u) => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${u.is_admin ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-lg tracking-tight">{u.name}</p>
                        {u.is_admin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded border border-emerald-200 tracking-wider">
                            <Crown size={12} /> ADMIN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                        <Mail size={14} />
                        {u.email} <span className="text-gray-300 mx-1">•</span> ID: {u.id}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="font-black text-emerald-600 text-lg">Rp {Number(u.balance).toLocaleString('id-ID')}</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wide">Bergabung {u.joined}</p>
                    </div>
                    {/* Edit actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <button 
                        onClick={() => handleAdjustBalance(u)}
                        className="text-xs font-bold bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow hover:border-emerald-200"
                      >
                        UBAH SALDO
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center text-gray-500">
              {statsLoading ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-emerald-500" size={32} />
                  <span className="font-bold uppercase tracking-widest text-sm">Memuat Database...</span>
                </div>
              ) : (
                <span className="font-bold uppercase tracking-widest">Tidak ada pengguna</span>
              )}
            </div>
          )}
        </div>

        {/* Daftar Produk */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Katalog Produk Hijau</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTambahProduk}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl border border-emerald-700 shadow-sm transition-all"
              >
                TAMBAH PRODUK
              </button>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1 rounded-full">
                {stats?.products?.length || 0} PRODUK
              </span>
            </div>
          </div>
          {stats?.products && stats.products.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.products.map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img src={globalProjectImages[p.title] || fallbackImage} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-md tracking-tight">{p.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <span className="uppercase text-blue-600 font-bold">{p.category}</span> • ID: {p.product_id}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <button 
                        onClick={() => handleEditProduct(p)}
                        className="text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow hover:border-blue-200"
                      >
                        EDIT PRODUK
                      </button>
                      <button
                        onClick={() => handleHapusProduk(p)}
                        className="text-xs font-bold bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow hover:border-red-200"
                      >
                        HAPUS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <span className="font-bold uppercase tracking-widest">Tidak Ada Produk</span>
            </div>
          )}
        </div>

        {/* Riwayat Transaksi */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Riwayat Transaksi</h2>
            <button
              onClick={() => fetchTransactions()}
              disabled={transactionsLoading}
              className="text-xs font-bold bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition-all disabled:opacity-50"
            >
              {transactionsLoading ? "MEMUAT..." : "MUAT ULANG"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Status Pembayaran</th>
                  <th className="px-6 py-4">Referensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                      {transactionsLoading ? "Memuat transaksi..." : "Belum ada transaksi."}
                    </td>
                  </tr>
                ) : null}

                {transactions.map((t, idx) => {
                  const nama = t.user?.name || t.user_name || "User tidak dikenal";
                  const email = t.user?.email || t.user_email || "";
                  return (
                    <tr key={String(t.id ?? idx)} className="text-sm">
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatTanggal(t.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{nama}</div>
                        <div className="text-xs text-gray-500">{email || "—"}</div>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900 whitespace-nowrap">{formatRupiah(t.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${getBadgeStatus(t.status)}`}>
                          {getIndonesianStatus(t.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap font-mono text-xs">{t.reference || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
