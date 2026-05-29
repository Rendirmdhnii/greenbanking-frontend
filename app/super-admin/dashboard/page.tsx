"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  transaction_type_label?: string;
  type?: string;
  sender_name?: string;
  receiver_name?: string;
  transaction_id?: string;
}

export default function SuperAdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Pagination & Search States
  const [searchQueryNasabah, setSearchQueryNasabah] = useState("");
  const [currentPageNasabah, setCurrentPageNasabah] = useState(1);
  const [currentPageTransaksi, setCurrentPageTransaksi] = useState(1);
  const itemsPerNasabahPage = 5;
  const itemsPerTransaksiPage = 10;

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
        
        const groupedMap = new Map<string, AdminTransaction>();
        
        (Array.isArray(list) ? list : []).forEach((t: AdminTransaction) => {
          const rawId = t.reference || t.transaction_id || String(t.id || "");
          const baseId = rawId.replace(/-(D|K)$/i, "");
          
          if (!groupedMap.has(baseId)) {
            groupedMap.set(baseId, { ...t, transaction_id: baseId, reference: baseId });
          } else {
            const existing = groupedMap.get(baseId)!;
            if (!existing.sender_name && t.sender_name) existing.sender_name = t.sender_name;
            if (!existing.receiver_name && t.receiver_name) existing.receiver_name = t.receiver_name;
          }
        });
        
        setTransactions(Array.from(groupedMap.values()));
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
    const { value: formValues } = await Swal.fire({
      title: `Penyesuaian Saldo: ${user.name}`,
      html: `
        <div style="text-align: left; margin-bottom: 1rem; padding: 0 10px;">
          <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.875rem; color: #374151;">Tipe Aksi</label>
          <div style="display: flex; gap: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="radio" name="swal-action" value="add" checked style="accent-color: #059669;" />
              <span style="font-size: 0.875rem;">Tambah Saldo (+)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="radio" name="swal-action" value="subtract" style="accent-color: #dc2626;" />
              <span style="font-size: 0.875rem;">Kurangi Saldo (-)</span>
            </label>
          </div>
        </div>
        <div style="text-align: left; padding: 0 10px;">
          <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.875rem; color: #374151;">Nominal</label>
          <input id="swal-amount" type="number" class="swal2-input" style="width: 100%; margin: 0; box-sizing: border-box; height: 3em; font-size: 1rem; padding: 0 1em;" placeholder="Contoh: 50000">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      background: '#ffffff',
      color: '#111827',
      confirmButtonText: 'Eksekusi God Mode',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const amountEl = document.getElementById('swal-amount') as HTMLInputElement;
        const actionEl = document.querySelector('input[name="swal-action"]:checked') as HTMLInputElement;
        
        if (!amountEl || !amountEl.value) {
          Swal.showValidationMessage('Nominal wajib diisi!');
          return false;
        }

        try {
          const token = localStorage.getItem('admin_token');
          const payload = { 
            action: actionEl.value,
            amount: Number(amountEl.value) 
          };
          
          const res = await fetch(`${API_URL}/admin/users/${user.id}/adjust-balance`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Gagal mengubah saldo');
          }
          return await res.json();
        } catch (error: any) {
          Swal.showValidationMessage(`Akses Ditolak: ${error.message}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (formValues) {
      Swal.fire({
        icon: 'success',
        title: 'Sukses Mutlak!',
        text: `Saldo nasabah berhasil di-update secara realtime.`,
        background: '#ffffff',
        color: '#111827',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
      }).then(() => {
        fetchStats(); // Refresh data realtime
      });
    }
  };

  const handleToggleBan = async (user: UserItem) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Otoritas Blokir Nasabah',
      text: `Anda akan mengeksekusi penangguhan akun: ${user.name}. Lanjutkan?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Suspend!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const res = await fetch(`${API_URL}/admin/users/${user.id}/toggle-ban`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Gagal mengeksekusi aksi ban');
          }
          return await res.json();
        } catch (error: any) {
          Swal.showValidationMessage(`Sistem menolak: ${error.message}`);
        }
      }
    });

    if (isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Dieksekusi!',
        text: 'Status pengguna berhasil diperbarui.',
        background: '#ffffff',
        color: '#111827',
        confirmButtonColor: '#059669',
        timer: 3000
      }).then(() => fetchStats());
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
        const res = await fetch(`${API_URL}/admin/products/store`, {
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
      const res = await fetch(`${API_URL}/admin/products/${product.id}/delete`, {
        method: "POST",
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
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

  // ─── FILTER & PAGINATION LOGIC ───
  const filteredNasabah = stats?.users?.filter(u => 
    u.name.toLowerCase().includes(searchQueryNasabah.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQueryNasabah.toLowerCase())
  ) || [];
  
  const totalPagesNasabah = Math.ceil(filteredNasabah.length / itemsPerNasabahPage);
  const paginatedNasabah = filteredNasabah.slice(
    (currentPageNasabah - 1) * itemsPerNasabahPage, 
    currentPageNasabah * itemsPerNasabahPage
  );

  const totalPagesTransaksi = Math.ceil(transactions.length / itemsPerTransaksiPage);
  const paginatedTransactions = transactions.slice(
    (currentPageTransaksi - 1) * itemsPerTransaksiPage, 
    currentPageTransaksi * itemsPerTransaksiPage
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-900 text-emerald-50 flex-col hidden md:flex flex-shrink-0 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="p-6 flex items-center gap-3 border-b border-emerald-800/50 relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">GreenBanking</h1>
            <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold">Super Admin</p>
          </div>
        </div>
        
        <nav className="flex-1 py-8 flex flex-col gap-2 px-4 relative z-10">
          <div className="px-4 py-3 bg-emerald-800/50 rounded-xl flex items-center gap-3 text-white cursor-pointer border border-emerald-700/50 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-400"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
            <span className="font-bold text-sm">Dashboard Utama</span>
          </div>
          <div className="px-4 py-3 hover:bg-emerald-800/30 rounded-xl flex items-center gap-3 text-emerald-200 cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className="font-semibold text-sm">Database Nasabah</span>
          </div>
          <div className="px-4 py-3 hover:bg-emerald-800/30 rounded-xl flex items-center gap-3 text-emerald-200 cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
            <span className="font-semibold text-sm">Katalog Produk</span>
          </div>
          <div className="px-4 py-3 hover:bg-emerald-800/30 rounded-xl flex items-center gap-3 text-emerald-200 cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path></svg>
            <span className="font-semibold text-sm">Riwayat Transaksi</span>
          </div>
        </nav>
        
        <div className="p-6 border-t border-emerald-800/50 relative z-10">
          <div className="bg-emerald-950/50 p-4 rounded-xl mb-4 border border-emerald-800/50">
            <p className="text-xs text-emerald-300 mb-1">Akses Saat Ini</p>
            <p className="text-sm font-bold text-white truncate">{adminUser?.email || 'admin@greenbanking.com'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded-xl border border-red-500/20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
            <span className="font-bold text-sm">Logout Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Ikhtisar Platform</h2>
            <p className="text-sm text-gray-500 font-medium">Pusat kendali operasional dan transaksi</p>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { fetchStats(); fetchTransactions(); }}
              disabled={statsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors text-sm font-bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M21 12a9 9 0 1 0-9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg> 
              <span className="hidden sm:inline">{statsLoading ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{adminUser?.name || 'Super Admin'}</p>
                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Otoritas Penuh</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
                {(adminUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Visual Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[120px] h-[120px]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Nasabah</p>
                <h3 className="text-3xl font-black text-gray-900">{stats?.total_users || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[120px] h-[120px]"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo Beredar</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                  Rp {Number(stats?.total_balance || 0).toLocaleString('id-ID')}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(139,92,246,0.1)] hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[120px] h-[120px]"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Investasi Aktif</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                  Rp {Number(stats?.total_investments || 0).toLocaleString('id-ID')}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.1)] hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[120px] h-[120px]"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 border border-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Produk Hijau</p>
                <h3 className="text-3xl font-black text-gray-900">
                  {stats?.products?.length || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Kiri: Daftar Nasabah & Transaksi (2/3 width on large screens) */}
            <div className="xl:col-span-2 space-y-8">
              {/* Database Nasabah */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Database Nasabah</h2>
                      <p className="text-xs text-gray-500 font-medium">Manajemen akun pengguna</p>
                    </div>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Cari nama atau email..."
                      value={searchQueryNasabah}
                      onChange={(e) => {
                        setSearchQueryNasabah(e.target.value);
                        setCurrentPageNasabah(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-4">Nasabah</th>
                        <th className="px-6 py-4">Saldo</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(!filteredNasabah || filteredNasabah.length === 0) ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                            Tidak ada nasabah ditemukan.
                          </td>
                        </tr>
                      ) : (
                        paginatedNasabah?.map((u) => (
                          <tr key={u?.id || Math.random()} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 flex-shrink-0 ${u?.is_admin ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                  {(u?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{u?.name || 'Unknown'}</span>
                                    {u?.is_admin && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded border border-emerald-200 tracking-wider">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">{u?.email || 'Tidak ada email'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-black text-gray-900">Rp {Number(u?.balance || 0).toLocaleString('id-ID')}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => u && handleAdjustBalance(u)}
                                  className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                                >
                                  EDIT SALDO
                                </button>
                                <button 
                                  onClick={() => u && handleToggleBan(u)}
                                  className="text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                                >
                                  SUSPEND
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPagesNasabah > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <span className="text-xs font-medium text-gray-500">
                      Hal {currentPageNasabah || 1} / {totalPagesNasabah || 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPageNasabah(p => Math.max(1, (p || 1) - 1))}
                        disabled={currentPageNasabah === 1}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"></path></svg>
                      </button>
                      <button
                        onClick={() => setCurrentPageNasabah(p => Math.min(totalPagesNasabah, (p || 1) + 1))}
                        disabled={currentPageNasabah === totalPagesNasabah}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"></path></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Riwayat Transaksi (Visual Overhaul) */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-600"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Riwayat Transaksi Terpadu</h2>
                      <p className="text-xs text-gray-500 font-medium">Monitoring pergerakan dana real-time</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-4">Waktu & Trace ID</th>
                        <th className="px-6 py-4">Tipe Transaksi</th>
                        <th className="px-6 py-4">Alur Uang</th>
                        <th className="px-6 py-4">Nominal</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(!transactions || transactions.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                            {transactionsLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin text-indigo-500"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                                <span>Memuat data...</span>
                              </div>
                            ) : "Belum ada transaksi."}
                          </td>
                        </tr>
                      ) : null}

                      {paginatedTransactions?.map((t, idx) => {
                        const nama = t?.user?.name || t?.user_name || "User";
                        const email = t?.user?.email || t?.user_email || "";
                        
                        let tipe = t?.transaction_type_label || String(t?.type || "Transaksi").toUpperCase();
                        let badgeColor = "bg-gray-100 text-gray-700 border-gray-200";
                        
                        if (tipe.toLowerCase().includes("transfer")) {
                          tipe = "Transfer Dana";
                          badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                        } else if (tipe.toLowerCase().includes("topup") || tipe.toLowerCase().includes("top up") || tipe.toLowerCase().includes("deposit")) {
                          tipe = "Top Up Saldo";
                          badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        }

                        let senderName = t?.sender_name || nama;
                        let senderEmail = email;
                        let receiverName = t?.receiver_name || "-";
                        let receiverEmail = "";

                        if (tipe === "Top Up Saldo") {
                          senderName = "Sistem Bank";
                          senderEmail = "Otomatis";
                          receiverName = nama;
                          receiverEmail = email;
                        } else if (t?.type?.toLowerCase() === 'withdrawal' || t?.type?.toLowerCase() === 'tarik tunai') {
                          senderName = nama;
                          senderEmail = email;
                          receiverName = "Sistem Bank";
                          receiverEmail = "Otomatis";
                        } else {
                          if (!t?.receiver_name && !t?.sender_name) {
                            receiverName = "Tujuan Tidak Diketahui";
                          }
                        }

                        return (
                          <tr key={String(t?.id ?? idx)} className="text-sm hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-900 font-bold mb-1">{formatTanggal(t?.created_at)}</div>
                              <div className="font-mono text-xs text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded border border-gray-200 inline-block tracking-tight">
                                {t?.reference || t?.transaction_id || "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black border uppercase tracking-wider ${badgeColor}`}>
                                {tipe}
                              </span>
                            </td>
                            <td className="px-6 py-4 min-w-[320px]">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 text-right bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                  <div className="font-bold text-gray-900 truncate" title={senderName}>{senderName}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{senderEmail || '-'}</div>
                                </div>
                                <div className="flex-shrink-0 text-gray-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-emerald-500"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                </div>
                                <div className="flex-1 text-left bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                  <div className="font-bold text-gray-900 truncate" title={receiverName}>{receiverName}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{receiverEmail || '-'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-black text-gray-900 text-base">{formatRupiah(t?.amount || 0)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${getBadgeStatus(t?.status)}`}>
                                {getIndonesianStatus(t?.status)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPagesTransaksi > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <span className="text-xs font-medium text-gray-500">
                      Hal {currentPageTransaksi || 1} / {totalPagesTransaksi || 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPageTransaksi(p => Math.max(1, (p || 1) - 1))}
                        disabled={currentPageTransaksi === 1}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"></path></svg>
                      </button>
                      <button
                        onClick={() => setCurrentPageTransaksi(p => Math.min(totalPagesTransaksi, (p || 1) + 1))}
                        disabled={currentPageTransaksi === totalPagesTransaksi}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"></path></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kanan: Katalog Produk (1/3 width) */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-8">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-600"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Katalog Produk</h2>
                      <p className="text-xs text-gray-500 font-medium">Investasi & Donasi Hijau</p>
                    </div>
                  </div>
                  <button
                    onClick={handleTambahProduk}
                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                    title="Tambah Produk"
                  >
                    <span className="font-bold text-lg leading-none">+</span>
                  </button>
                </div>
                
                {(stats?.products && stats.products.length > 0) ? (
                  <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
                    {stats.products.map((p) => (
                      <div key={p?.id || Math.random()} className="p-6 hover:bg-gray-50/50 transition-colors group">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                            <img src={p?.title ? (globalProjectImages[p.title] || fallbackImage) : fallbackImage} alt={p?.title || 'Produk'} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight truncate mb-1" title={p?.title || 'Tanpa Judul'}>{p?.title || 'Tanpa Judul'}</h3>
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase tracking-wider mb-2">
                              {p?.category || 'Umum'}
                            </span>
                            <div className="text-xs font-bold text-emerald-600">
                              Target: {formatRupiah(p?.target_funding || 0)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button 
                            onClick={() => p && handleEditProduct(p)}
                            className="flex-1 text-[11px] font-bold bg-white hover:bg-gray-50 text-gray-700 py-2 rounded-lg border border-gray-200 transition-colors"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => p && handleHapusProduk(p)}
                            className="flex-1 text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg border border-red-100 transition-colors"
                          >
                            HAPUS
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-sm font-medium text-gray-500">
                    Katalog kosong.
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
