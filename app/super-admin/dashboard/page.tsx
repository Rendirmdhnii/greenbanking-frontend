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
  tipe_investasi?: string;
  tenor_bulan?: number;
  topik_lingkungan?: string;
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
  sender?: any;
  receiver?: any;
  sender_email?: string;
  receiver_email?: string;
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

  // Demo Mode: Pantau & Percepat Investasi Nasabah States
  const [adminInvestments, setAdminInvestments] = useState<any[]>([]);
  const [adminInvestmentsLoading, setAdminInvestmentsLoading] = useState(false);
  const [searchQueryInvestasi, setSearchQueryInvestasi] = useState("");
  const [currentPageInvestasi, setCurrentPageInvestasi] = useState(1);
  const itemsPerInvestasiPage = 10;

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

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
          fetchAdminInvestments(token);
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
          const isOut = t.type === 'out' || rawId.endsWith('-D');
          const isIn = t.type === 'in' || rawId.endsWith('-K');
          
          if (!groupedMap.has(baseId)) {
            const newTx: any = { ...t, transaction_id: baseId, reference: baseId };
            if (isOut) {
              newTx.sender_name = t.user?.name;
              newTx.sender_email = t.user?.email;
              newTx.sender = t.user;
            }
            if (isIn) {
              newTx.receiver_name = t.user?.name;
              newTx.receiver_email = t.user?.email;
              newTx.receiver = t.user;
            }
            groupedMap.set(baseId, newTx);
          } else {
            const existing: any = groupedMap.get(baseId)!;
            if (isOut) {
              existing.sender_name = t.user?.name || existing.sender_name;
              existing.sender_email = t.user?.email || existing.sender_email;
              existing.sender = t.user || existing.sender;
            }
            if (isIn) {
              existing.receiver_name = t.user?.name || existing.receiver_name;
              existing.receiver_email = t.user?.email || existing.receiver_email;
              existing.receiver = t.user || existing.receiver;
            }
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

  const fetchAdminInvestments = async (tokenOverride?: string) => {
    setAdminInvestmentsLoading(true);
    try {
      const token = tokenOverride || localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/investments`, {
        cache: 'no-store',
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const d = await res.json();
        setAdminInvestments(d.investments || []);
      }
    } catch (e) {
      console.error("Gagal memuat data investasi nasabah:", e);
    } finally {
      setAdminInvestmentsLoading(false);
    }
  };

  const handleAccelerate = async (inv: any) => {
    const { value: formValues } = await Swal.fire({
      title: "Mesin Waktu: Edit Waktu Investasi",
      html: `
        <div style="text-align: left; margin-bottom: 1rem; padding: 0 10px;">
          <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 1.25rem; line-height: 1.5;">
            Masukkan jumlah waktu untuk memundurkan tanggal mulai investasi nasabah <strong>${inv.nasabah_name}</strong> pada proyek <strong>${inv.name}</strong>.
          </p>
          <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.875rem; color: #374151;">Jumlah Waktu</label>
          <input id="swal-time-value" type="number" class="swal2-input" style="width: 100%; margin: 0 0 1.25rem 0; box-sizing: border-box; height: 3em; font-size: 1rem; padding: 0 1em;" placeholder="Contoh: 10" min="1" value="1">
          
          <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.875rem; color: #374151;">Satuan Waktu</label>
          <select id="swal-time-unit" class="swal2-select" style="width: 100%; margin: 0; box-sizing: border-box; height: 3em; font-size: 1rem; display: flex;">
            <option value="days">Hari</option>
            <option value="months">Bulan</option>
          </select>
          <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem; line-height: 1.4;">
            Contoh: Ketik 6 lalu pilih 'Bulan' untuk memajukan waktu investasi menjadi 6 bulan yang lalu.
          </p>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      background: '#ffffff',
      color: '#111827',
      confirmButtonText: 'Simpan Percepatan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const valueEl = document.getElementById('swal-time-value') as HTMLInputElement;
        const unitEl = document.getElementById('swal-time-unit') as HTMLSelectElement;
        
        if (!valueEl || !valueEl.value || Number(valueEl.value) <= 0) {
          Swal.showValidationMessage('Jumlah waktu harus diisi dan berupa angka positif!');
          return false;
        }

        try {
          const token = localStorage.getItem('admin_token');
          const payload = {
            id: inv.id,
            value: Number(valueEl.value),
            unit: unitEl.value
          };
          
          const res = await fetch(`${API_URL}/admin/invest/fast-forward`, {
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
            throw new Error(errorData.error || errorData.message || 'Gagal mengubah waktu investasi');
          }
          return await res.json();
        } catch (error: any) {
          Swal.showValidationMessage(`Akses Ditolak/Error: ${error.message}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (formValues) {
      Swal.fire({
        icon: 'success',
        title: 'Bypass Berhasil!',
        text: 'Waktu investasi berhasil dimundurkan. Gembok tenor & perhitungan profit nasabah telah ter-update!',
        background: '#ffffff',
        color: '#111827',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
      });
      fetchAdminInvestments();
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
          <input id="swal-amount" type="text" inputmode="numeric" class="swal2-input" style="width: 100%; margin: 0; box-sizing: border-box; height: 3em; font-size: 1rem; padding: 0 1em;" placeholder="Contoh: 50.000">
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
      didOpen: () => {
        const amountInput = document.getElementById('swal-amount') as HTMLInputElement;
        if (amountInput) {
          amountInput.addEventListener('input', () => {
            let val = amountInput.value.replace(/\./g, '').replace(/[^0-9]/g, '');
            if (val) {
              amountInput.value = Number(val).toLocaleString('id-ID');
            } else {
              amountInput.value = '';
            }
          });
        }
      },
      preConfirm: async () => {
        const amountEl = document.getElementById('swal-amount') as HTMLInputElement;
        const actionEl = document.querySelector('input[name="swal-action"]:checked') as HTMLInputElement;
        
        if (!amountEl || !amountEl.value) {
          Swal.showValidationMessage('Nominal wajib diisi!');
          return false;
        }

        const rawAmount = Number(amountEl.value.replace(/\./g, ''));
        if (isNaN(rawAmount) || rawAmount <= 0) {
          Swal.showValidationMessage('Nominal harus berupa angka valid di atas 0!');
          return false;
        }

        try {
          const token = localStorage.getItem('admin_token');
          const payload = { 
            action: actionEl.value,
            amount: rawAmount 
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
      html: `
        <div class="grid grid-cols-2 gap-4 text-left p-2">
          <!-- Tipe Utama -->
          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tipe Utama</label>
            <div class="flex gap-6 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input type="radio" name="swal-tipe-utama" value="investment" checked class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                <span class="text-sm font-semibold text-gray-700">Investasi</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input type="radio" name="swal-tipe-utama" value="donation" class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                <span class="text-sm font-semibold text-gray-700">Donasi</span>
              </label>
            </div>
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Judul Produk</label>
            <input id="swal-title" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0" placeholder="Contoh: Rehabilitasi Mangrove">
          </div>
          
          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Upload Gambar Produk</label>
            <input id="swal-image-file" type="file" accept="image/*" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 border-dashed rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 !mt-0 !mb-0">
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Topik Lingkungan</label>
            <select id="swal-topik-lingkungan" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 font-semibold !mt-0 !mb-0">
              <option value="Energi Surya">Energi Surya</option>
              <option value="Pengolahan Limbah">Pengolahan Limbah</option>
              <option value="Reboisasi Mangrove">Reboisasi Mangrove</option>
              <option value="Bio-Gas">Bio-Gas</option>
            </select>
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Deskripsi (opsional)</label>
            <textarea id="swal-desc" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0" style="min-height: 80px;" placeholder="Tuliskan ringkasan proyek..."></textarea>
          </div>

          <div id="swal-category-wrapper">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kategori</label>
            <input id="swal-category" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0" placeholder="Contoh: Restorasi" value="investment">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Minimal Invest/Donasi (Rp)</label>
            <input id="swal-min" type="text" inputmode="numeric" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="10.000">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Target Dana (Rp)</label>
            <input id="swal-target" type="text" inputmode="numeric" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="0">
          </div>

          <!-- Investment specific container -->
          <div id="swal-investment-container" class="col-span-2 grid grid-cols-2 gap-4 !p-0 !m-0">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kategori Investasi</label>
              <select id="swal-tipe-investasi" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold">
                <option value="liquid">Liquid (Fleksibel)</option>
                <option value="tenor">Tenor (Dikunci)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Persentase Bunga/ROI (% p.a.)</label>
              <input id="swal-roi" type="number" step="0.1" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="0">
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Lama Tenor (Bulan) <span class="text-[10px] text-gray-400 font-normal uppercase tracking-normal">(Isi 0 jika Liquid)</span></label>
              <input id="swal-tenor-bulan" type="number" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="0">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Hari Tersisa (opsional)</label>
            <input id="swal-days" type="number" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="0">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan Produk",
      cancelButtonText: "Batal",
      background: "#ffffff",
      color: "#111827",
      customClass: {
        popup: 'rounded-2xl shadow-xl max-w-2xl w-full mx-4 md:mx-auto font-sans p-6',
        confirmButton: 'px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg outline-none border-0 cursor-pointer',
        cancelButton: 'px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl transition-all ml-3 outline-none border-0 cursor-pointer'
      },
      buttonsStyling: false,
      didOpen: () => {
        const radios = document.querySelectorAll('input[name="swal-tipe-utama"]');
        const investContainer = document.getElementById('swal-investment-container');
        const categoryWrapper = document.getElementById('swal-category-wrapper');
        const categoryInput = document.getElementById('swal-category') as HTMLInputElement;

        const handleTypeChange = () => {
          const selected = (document.querySelector('input[name="swal-tipe-utama"]:checked') as HTMLInputElement)?.value;
          if (selected === 'donation') {
            if (investContainer) investContainer.style.setProperty('display', 'none', 'important');
            if (categoryWrapper) categoryWrapper.style.setProperty('display', 'none', 'important');
            if (categoryInput) categoryInput.value = 'donation';
          } else {
            if (investContainer) investContainer.style.setProperty('display', 'grid', 'important');
            if (categoryWrapper) categoryWrapper.style.setProperty('display', 'block', 'important');
            if (categoryInput && categoryInput.value === 'donation') {
              categoryInput.value = 'investment';
            }
          }
        };

        radios.forEach(radio => {
          radio.addEventListener('change', handleTypeChange);
        });

        handleTypeChange();

        // Real-time Rupiah formatting
        const minInput = document.getElementById('swal-min') as HTMLInputElement;
        const targetInput = document.getElementById('swal-target') as HTMLInputElement;

        const formatRupiahInput = (input: HTMLInputElement) => {
          let val = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');
          if (val) {
            input.value = Number(val).toLocaleString('id-ID');
          } else {
            input.value = '';
          }
        };

        if (minInput) {
          formatRupiahInput(minInput);
          minInput.addEventListener('input', () => formatRupiahInput(minInput));
        }
        if (targetInput) {
          formatRupiahInput(targetInput);
          targetInput.addEventListener('input', () => formatRupiahInput(targetInput));
        }
      },
      preConfirm: () => {
        const title = (document.getElementById("swal-title") as HTMLInputElement).value;
        const isDonation = (document.querySelector('input[name="swal-tipe-utama"]:checked') as HTMLInputElement)?.value === 'donation';
        const category = isDonation ? 'donation' : ((document.getElementById("swal-category") as HTMLInputElement).value || 'investment');
        const imageFileInput = document.getElementById("swal-image-file") as HTMLInputElement;
        const imageFile = imageFileInput?.files?.[0];
        const topikLingkungan = (document.getElementById("swal-topik-lingkungan") as HTMLSelectElement).value;

        if (!title.trim() || (!isDonation && !category.trim())) {
          Swal.showValidationMessage("Judul dan kategori wajib diisi.");
          return null;
        }
        return {
          title,
          category,
          imageFile,
          topik_lingkungan: topikLingkungan,
          description: (document.getElementById("swal-desc") as HTMLTextAreaElement).value,
          target_funding: Number((document.getElementById("swal-target") as HTMLInputElement).value.replace(/\./g, '')),
          min_amount: Number((document.getElementById("swal-min") as HTMLInputElement).value.replace(/\./g, '')),
          interest_rate: isDonation ? 0 : Number((document.getElementById("swal-roi") as HTMLInputElement).value),
          days_left: Number((document.getElementById("swal-days") as HTMLInputElement).value),
          tipe_investasi: isDonation ? 'donasi' : (document.getElementById("swal-tipe-investasi") as HTMLSelectElement).value,
          tenor_bulan: isDonation ? 0 : Number((document.getElementById("swal-tenor-bulan") as HTMLInputElement).value),
        };
      },
    });

    if (formValues) {
      try {
        const token = localStorage.getItem("admin_token");
        const formData = new FormData();
        formData.append("title", formValues.title);
        formData.append("category", formValues.category);
        formData.append("description", formValues.description);
        formData.append("target_funding", String(formValues.target_funding));
        formData.append("min_amount", String(formValues.min_amount));
        formData.append("interest_rate", String(formValues.interest_rate));
        formData.append("days_left", String(formValues.days_left));
        formData.append("tipe_investasi", formValues.tipe_investasi);
        formData.append("tenor_bulan", String(formValues.tenor_bulan));
        formData.append("topik_lingkungan", formValues.topik_lingkungan);

        formData.append("type", formValues.category === 'donation' ? 'donasi' : 'investasi');
        formData.append("target_fund", String(formValues.target_funding));
        formData.append("min_transaction", String(formValues.min_amount));
        formData.append("roi_percentage", String(formValues.interest_rate));
        formData.append("tenor_months", String(formValues.tenor_bulan));

        if (formValues.imageFile) {
          formData.append("image", formValues.imageFile);
        }

        const res = await fetch(`${API_URL}/admin/products/store`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
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
      html: `
        <div class="grid grid-cols-2 gap-4 text-left p-2">
          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Judul Produk</label>
            <input id="swal-title" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0" value="${product.title}">
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Upload Gambar Produk Baru (opsional)</label>
            <input id="swal-image-file" type="file" accept="image/*" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 border-dashed rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 !mt-0 !mb-0">
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Topik Lingkungan</label>
            <select id="swal-topik-lingkungan" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 font-semibold !mt-0 !mb-0">
              <option value="Energi Surya" ${product.topik_lingkungan === 'Energi Surya' ? 'selected' : ''}>Energi Surya</option>
              <option value="Pengolahan Limbah" ${product.topik_lingkungan === 'Pengolahan Limbah' ? 'selected' : ''}>Pengolahan Limbah</option>
              <option value="Reboisasi Mangrove" ${product.topik_lingkungan === 'Reboisasi Mangrove' ? 'selected' : ''}>Reboisasi Mangrove</option>
              <option value="Bio-Gas" ${product.topik_lingkungan === 'Bio-Gas' ? 'selected' : ''}>Bio-Gas</option>
            </select>
          </div>
          
          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Deskripsi</label>
            <textarea id="swal-desc" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0" style="min-height: 80px;">${product.description || ''}</textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Target Dana (Rp)</label>
            <input id="swal-target" type="text" inputmode="numeric" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="${product.target_funding || 0}">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Minimal Invest/Donasi (Rp)</label>
            <input id="swal-min" type="text" inputmode="numeric" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="${product.min_amount || 0}">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kategori Investasi</label>
            <select id="swal-tipe-investasi" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold">
              <option value="liquid" ${product.tipe_investasi === 'liquid' ? 'selected' : ''}>Liquid (Fleksibel)</option>
              <option value="tenor" ${product.tipe_investasi === 'tenor' ? 'selected' : ''}>Tenor (Dikunci)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Bunga / ROI (%)</label>
            <input id="swal-roi" type="number" step="0.1" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="${product.interest_rate || 0}">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Lama Tenor (Bulan) <span class="text-[10px] text-gray-400 font-normal uppercase tracking-normal">(Isi 0 jika Liquid)</span></label>
            <input id="swal-tenor-bulan" type="number" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="${product.tenor_bulan || 0}">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Hari Tersisa</label>
            <input id="swal-days" type="number" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-gray-900 !mt-0 !mb-0 font-semibold" value="${product.days_left || 0}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      background: '#ffffff',
      color: '#111827',
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl shadow-xl max-w-2xl w-full mx-4 md:mx-auto font-sans p-6',
        confirmButton: 'px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg outline-none border-0 cursor-pointer',
        cancelButton: 'px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl transition-all ml-3 outline-none border-0 cursor-pointer'
      },
      buttonsStyling: false,
      didOpen: () => {
        const minInput = document.getElementById('swal-min') as HTMLInputElement;
        const targetInput = document.getElementById('swal-target') as HTMLInputElement;

        const formatRupiahInput = (input: HTMLInputElement) => {
          let val = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');
          if (val) {
            input.value = Number(val).toLocaleString('id-ID');
          } else {
            input.value = '';
          }
        };

        if (minInput) {
          formatRupiahInput(minInput);
          minInput.addEventListener('input', () => formatRupiahInput(minInput));
        }
        if (targetInput) {
          formatRupiahInput(targetInput);
          targetInput.addEventListener('input', () => formatRupiahInput(targetInput));
        }
      },
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const imageFileInput = document.getElementById('swal-image-file') as HTMLInputElement;
        const imageFile = imageFileInput?.files?.[0];
        const topikLingkungan = (document.getElementById('swal-topik-lingkungan') as HTMLSelectElement).value;

        return {
          title,
          imageFile,
          topik_lingkungan: topikLingkungan,
          description: (document.getElementById('swal-desc') as HTMLTextAreaElement).value,
          target_funding: Number((document.getElementById('swal-target') as HTMLInputElement).value.replace(/\./g, '')),
          min_amount: Number((document.getElementById('swal-min') as HTMLInputElement).value.replace(/\./g, '')),
          interest_rate: Number((document.getElementById('swal-roi') as HTMLInputElement).value),
          days_left: Number((document.getElementById('swal-days') as HTMLInputElement).value),
          tipe_investasi: (document.getElementById('swal-tipe-investasi') as HTMLSelectElement).value,
          tenor_bulan: Number((document.getElementById('swal-tenor-bulan') as HTMLInputElement).value),
        };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('admin_token');
        const formData = new FormData();
        formData.append("title", formValues.title);
        formData.append("description", formValues.description);
        formData.append("target_funding", String(formValues.target_funding));
        formData.append("min_amount", String(formValues.min_amount));
        formData.append("interest_rate", String(formValues.interest_rate));
        formData.append("days_left", String(formValues.days_left));
        formData.append("tipe_investasi", formValues.tipe_investasi);
        formData.append("tenor_bulan", String(formValues.tenor_bulan));
        formData.append("topik_lingkungan", formValues.topik_lingkungan);

        formData.append("type", product.category === 'donation' || product.category === 'donasi' ? 'donasi' : 'investasi');
        formData.append("target_fund", String(formValues.target_funding));
        formData.append("min_transaction", String(formValues.min_amount));
        formData.append("roi_percentage", String(formValues.interest_rate));
        formData.append("tenor_months", String(formValues.tenor_bulan));

        if (formValues.imageFile) {
          formData.append("image", formValues.imageFile);
        }

        const res = await fetch(`${API_URL}/admin/products/${product.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: formData
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

  // Filter & Pagination for Investments (Demo Mode)
  const filteredInvestments = adminInvestments.filter(inv =>
    (inv.nasabah_name || "").toLowerCase().includes(searchQueryInvestasi.toLowerCase()) ||
    (inv.name || "").toLowerCase().includes(searchQueryInvestasi.toLowerCase()) ||
    (inv.nasabah_email || "").toLowerCase().includes(searchQueryInvestasi.toLowerCase())
  );
  
  const totalPagesInvestasi = Math.ceil(filteredInvestments.length / itemsPerInvestasiPage);
  const paginatedInvestments = filteredInvestments.slice(
    (currentPageInvestasi - 1) * itemsPerInvestasiPage,
    currentPageInvestasi * itemsPerInvestasiPage
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
          <div 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-800/50 text-white border border-emerald-700/50 shadow-inner' : 'hover:bg-emerald-800/30 text-emerald-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-emerald-400' : ''}`}><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
            <span className={`text-sm ${activeTab === 'dashboard' ? 'font-bold' : 'font-semibold'}`}>Dashboard Utama</span>
          </div>
          <div 
            onClick={() => setActiveTab('nasabah')}
            className={`px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'nasabah' ? 'bg-emerald-800/50 text-white border border-emerald-700/50 shadow-inner' : 'hover:bg-emerald-800/30 text-emerald-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${activeTab === 'nasabah' ? 'text-emerald-400' : ''}`}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className={`text-sm ${activeTab === 'nasabah' ? 'font-bold' : 'font-semibold'}`}>Database Nasabah</span>
          </div>
          <div 
            onClick={() => setActiveTab('produk')}
            className={`px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'produk' ? 'bg-emerald-800/50 text-white border border-emerald-700/50 shadow-inner' : 'hover:bg-emerald-800/30 text-emerald-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${activeTab === 'produk' ? 'text-emerald-400' : ''}`}><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
            <span className={`text-sm ${activeTab === 'produk' ? 'font-bold' : 'font-semibold'}`}>Katalog Produk</span>
          </div>
          <div 
            onClick={() => setActiveTab('transaksi')}
            className={`px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'transaksi' ? 'bg-emerald-800/50 text-white border border-emerald-700/50 shadow-inner' : 'hover:bg-emerald-800/30 text-emerald-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${activeTab === 'transaksi' ? 'text-emerald-400' : ''}`}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path></svg>
            <span className={`text-sm ${activeTab === 'transaksi' ? 'font-bold' : 'font-semibold'}`}>Riwayat Transaksi</span>
          </div>
          <div 
            onClick={() => { setActiveTab('pantau_investasi'); fetchAdminInvestments(); }}
            className={`px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'pantau_investasi' ? 'bg-emerald-800/50 text-white border border-emerald-700/50 shadow-inner' : 'hover:bg-emerald-800/30 text-emerald-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${activeTab === 'pantau_investasi' ? 'text-emerald-400' : ''}`}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span className={`text-sm ${activeTab === 'pantau_investasi' ? 'font-bold' : 'font-semibold'}`}>Pantau Investasi</span>
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
              onClick={() => { fetchStats(); fetchTransactions(); fetchAdminInvestments(); }}
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
        <main className="flex-1 overflow-y-auto w-full">
          {/* Centered Main Container */}
          <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
            
            {/* Conditional Rendering: SUMMARY CARDS (Dashboard Only) */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden flex items-center gap-4">
                  <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[80px] h-[80px]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Nasabah</p>
                    <h3 className="text-base font-black text-gray-900 break-words whitespace-normal" title={String(stats?.total_users || 0)}>{stats?.total_users || 0}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden flex items-center gap-4">
                  <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[80px] h-[80px]"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Saldo Beredar</p>
                    <h3 className="text-base font-black text-gray-900 break-words whitespace-normal" title={`Rp ${Number(stats?.total_balance || 0).toLocaleString('id-ID')}`}>
                      Rp {Number(stats?.total_balance || 0).toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden flex items-center gap-4">
                  <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[80px] h-[80px]"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Investasi Aktif</p>
                    <h3 className="text-base font-black text-gray-900 break-words whitespace-normal" title={`Rp ${Number(stats?.total_investments || 0).toLocaleString('id-ID')}`}>
                      Rp {Number(stats?.total_investments || 0).toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden flex items-center gap-4">
                  <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[80px] h-[80px]"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Produk Hijau</p>
                    <h3 className="text-base font-black text-gray-900 break-words whitespace-normal">
                      {stats?.products?.length || 0}
                    </h3>
                  </div>
                </div>
              </div>
            )}


            {/* Main Content Sections */}
            {activeTab === 'dashboard' ? (
              <>
                {/* Database Nasabah (Dashboard View: Full Width, 5 items, no scrollbar, has "Lihat Semua") */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Database Nasabah</h2>
                        <p className="text-xs text-gray-500 font-medium font-sans">Manajemen akun pengguna</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('nasabah')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                    >
                      Lihat Semua &rarr;
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                          <th className="px-6 py-3">Nasabah</th>
                          <th className="px-6 py-3">Saldo</th>
                          <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {(!stats?.users || stats.users.length === 0) ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-6 text-center text-sm font-medium text-gray-500">
                              Tidak ada nasabah ditemukan.
                            </td>
                          </tr>
                        ) : (
                          stats.users.slice(0, 5).map((u) => (
                            <tr key={u?.id || Math.random()} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 ${u?.is_admin ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                    {(u?.name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-gray-900 text-sm truncate max-w-[150px]" title={u?.name || 'Unknown'}>{u?.name || 'Unknown'}</span>
                                      {u?.is_admin && (
                                        <span className="inline-flex items-center gap-1 px-1 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded border border-emerald-200 tracking-wider">
                                          ADMIN
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px]" title={u?.email || 'Tidak ada email'}>{u?.email || 'Tidak ada email'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className="font-black text-gray-900 text-sm">Rp {Number(u?.balance || 0).toLocaleString('id-ID')}</span>
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => u && handleAdjustBalance(u)}
                                    className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200 transition-colors"
                                  >
                                    EDIT SALDO
                                  </button>
                                  <button 
                                    onClick={() => u && handleToggleBan(u)}
                                    className="text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded border border-red-200 transition-colors"
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
                </div>

                {/* Bottom Grid: Riwayat Transaksi & Katalog Produk */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Riwayat Transaksi Widget (col-span-8) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-8">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-600"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-gray-900">Riwayat Transaksi Terpadu</h2>
                          <p className="text-xs text-gray-500 font-medium">Monitoring pergerakan dana real-time</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('transaksi')}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                      >
                        Lihat Semua &rarr;
                      </button>
                    </div>

                    <div className="overflow-x-auto w-full">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                          <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-3">Waktu & Trace ID</th>
                            <th className="px-6 py-3">Tipe</th>
                            <th className="px-6 py-3">Pengirim</th>
                            <th className="px-6 py-3">Penerima</th>
                            <th className="px-6 py-3">Nominal</th>
                            <th className="px-6 py-3 pr-10">Status</th>
                          </tr> 
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {(!transactions || transactions.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-6 text-center text-sm font-medium text-gray-500">
                                {transactionsLoading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin text-indigo-500"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                                    <span>Memuat data...</span>
                                  </div>
                                ) : "Belum ada transaksi."}
                              </td>
                            </tr>
                          ) : (
                            transactions.slice(0, 5).map((t, idx) => {
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
                              let senderEmail = t?.sender_email || email;
                              let receiverName = t?.receiver_name || "-";
                              let receiverEmail = t?.receiver_email || "";

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
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="text-gray-900 font-bold mb-0.5 text-xs">{formatTanggal(t?.created_at)}</div>
                                    <div className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200 inline-block tracking-tight truncate max-w-[120px]" title={t?.reference || t?.transaction_id || "-"}>
                                      {t?.reference || t?.transaction_id || "-"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${badgeColor}`}>
                                      {tipe}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3">
                                    <div className="bg-gray-50/50 p-1.5 rounded border border-gray-100 max-w-[150px]">
                                      <div className="font-bold text-gray-900 text-xs truncate" title={senderName}>
                                        {senderName}
                                      </div>
                                      <div className="text-[9px] text-gray-500 truncate" title={senderEmail || '-'}>
                                        {senderEmail || '-'}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="text-emerald-500 font-bold text-sm flex-shrink-0">→</div>
                                      <div className="bg-gray-50/50 p-1.5 rounded border border-gray-100 max-w-[150px] flex-1 min-w-0">
                                        <div className="font-bold text-gray-900 text-xs truncate" title={receiverName}>
                                          {receiverName}
                                        </div>
                                        <div className="text-[9px] text-gray-500 truncate" title={receiverEmail || '-'}>
                                          {receiverEmail || '-'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <span className="font-black text-gray-900 text-xs">{formatRupiah(t?.amount || 0)}</span>
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap pr-10">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getBadgeStatus(t?.status)}`}>
                                      {getIndonesianStatus(t?.status)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Katalog Produk Widget (col-span-4) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-4 flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-600"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-gray-900">Katalog Produk</h2>
                          <p className="text-xs text-gray-500 font-medium">Investasi & Donasi Hijau</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleTambahProduk}
                          className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1.5 rounded-lg transition-colors"
                        >
                          + Tambah
                        </button>
                        <button 
                          onClick={() => setActiveTab('produk')}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-0.5"
                        >
                          Semua &rarr;
                        </button>
                      </div>
                    </div>

                    {(!stats?.products || stats.products.length === 0) ? (
                      <div className="p-6 text-center text-sm font-medium text-gray-500 flex-1 flex items-center justify-center">
                        Katalog kosong.   
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                        {stats.products.slice(0, 5).map((p) => (
                          <div key={p?.id || Math.random()} className="p-4 hover:bg-gray-50/50 transition-colors group flex items-center justify-between gap-3">
                            <div className="flex gap-3 min-w-0 items-center">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                <img src={p?.title ? (globalProjectImages[p.title] || fallbackImage) : fallbackImage} alt={p?.title || 'Produk'} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 text-xs leading-tight truncate mb-0.5" title={p?.title || 'Tanpa Judul'}>
                                  {p?.title || 'Tanpa Judul'}
                                </h3>
                                <span className="inline-block px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[9px] font-black uppercase tracking-wider mb-1">
                                  {p?.category || 'Umum'}
                                </span>
                                <div className="text-[10px] font-bold text-emerald-600">
                                  Target: {formatRupiah(p?.target_funding || 0)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button 
                                onClick={() => p && handleEditProduct(p)}
                                className="text-[10px] font-bold bg-white hover:bg-gray-50 text-gray-700 px-2 py-1 rounded border border-gray-200 transition-colors"
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => p && handleHapusProduk(p)}
                                className="text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded border border-red-100 transition-colors"
                              >
                                HAPUS
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Dedicated Tabs (Nasabah, Transaksi, Produk)
              <div className="grid grid-cols-1 gap-6">
                {activeTab === 'nasabah' && (
                  // Full Database Nasabah View
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Database Nasabah</h2>
                          <p className="text-xs text-gray-500 font-medium">Manajemen akun pengguna ({filteredNasabah.length} Total)</p>
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
                    
                    <div className="overflow-x-auto w-full">
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
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 flex-shrink-0 ${u?.is_admin ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                      {(u?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 truncate max-w-[200px]" title={u?.name || 'Unknown'}>{u?.name || 'Unknown'}</span>
                                        {u?.is_admin && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded border border-emerald-200 tracking-wider">
                                            ADMIN
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]" title={u?.email || 'Tidak ada email'}>{u?.email || 'Tidak ada email'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <span className="font-black text-gray-900 text-base">Rp {Number(u?.balance || 0).toLocaleString('id-ID')}</span>
                                </td>
                                <td className="px-6 py-5">
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
                )}

                {activeTab === 'transaksi' && (
                  // Full Riwayat Transaksi View
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-600"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Riwayat Transaksi Terpadu</h2>
                          <p className="text-xs text-gray-500 font-medium">Monitoring pergerakan dana real-time ({transactions.length} Total)</p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                          <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-4">Waktu & Trace ID</th>
                            <th className="px-6 py-4">Tipe Transaksi</th>
                            <th className="px-6 py-4">Pengirim</th>
                            <th className="px-6 py-4">Penerima</th>
                            <th className="px-6 py-4">Nominal</th>
                            <th className="px-6 py-4 pr-10">Status</th>
                          </tr> 
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {(!transactions || transactions.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                                {transactionsLoading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin text-indigo-500"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                                    <span>Memuat data...</span>
                                  </div>
                                ) : "Belum ada transaksi."}
                              </td>
                            </tr>
                          ) : (
                            paginatedTransactions?.map((t, idx) => {
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
                              let senderEmail = t?.sender_email || email;
                              let receiverName = t?.receiver_name || "-";
                              let receiverEmail = t?.receiver_email || "";

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
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="text-gray-900 font-bold mb-1">{formatTanggal(t?.created_at)}</div>
                                    <div className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 inline-block tracking-tight truncate max-w-[150px]" title={t?.reference || t?.transaction_id || "-"}>
                                      {t?.reference || t?.transaction_id || "-"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black border uppercase tracking-wider ${badgeColor}`}>
                                      {tipe}
                                    </span>
                                  </td>
                                  <td className="px-6 py-5">
                                    <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 min-w-[150px] max-w-[200px]">
                                      <div className="font-bold text-gray-900 truncate" title={senderName}>
                                        {senderName}
                                      </div>
                                      <div className="text-[10px] text-gray-500 truncate" title={senderEmail || '-'}>
                                        {senderEmail || '-'}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="flex-shrink-0 text-emerald-500 font-bold text-lg leading-none">→</div>
                                      <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 min-w-[150px] max-w-[200px] flex-1 min-w-0">
                                        <div className="font-bold text-gray-900 truncate" title={receiverName}>
                                          {receiverName}
                                        </div>
                                        <div className="text-[10px] text-gray-500 truncate" title={receiverEmail || '-'}>
                                          {receiverEmail || '-'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="font-black text-gray-900 text-base">{formatRupiah(t?.amount || 0)}</span>
                                  </td>
                                  <td className="px-6 py-5 whitespace-nowrap pr-10">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${getBadgeStatus(t?.status)}`}>
                                      {getIndonesianStatus(t?.status)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
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
                )}

                {activeTab === 'produk' && (
                  // Full Katalog Produk View
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-600"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Katalog Produk</h2>
                          <p className="text-xs text-gray-500 font-medium">Investasi & Donasi Hijau ({stats?.products?.length || 0} Total)</p>
                        </div>
                      </div>
                      <button
                        onClick={handleTambahProduk}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100 font-bold text-sm flex items-center gap-2"
                      >
                        <span>+ Tambah Produk</span>
                      </button>
                    </div>
                    
                    {(!stats?.products || stats.products.length === 0) ? (
                      <div className="p-12 text-center text-sm font-medium text-gray-500">
                        Katalog kosong.   
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {stats.products.map((p) => (
                          <div key={p?.id || Math.random()} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                              <div className="w-full h-40 bg-gray-200 rounded-xl overflow-hidden border border-gray-200 mb-4">
                                <img src={p?.title ? (globalProjectImages[p.title] || fallbackImage) : fallbackImage} alt={p?.title || 'Produk'} className="w-full h-full object-cover" />
                              </div>
                              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black uppercase tracking-wider mb-2">
                                {p?.category || 'Umum'}
                              </span>
                              <h3 className="font-bold text-gray-900 text-base mb-2">{p?.title || 'Tanpa Judul'}</h3>
                              <p className="text-xs text-gray-500 mb-4 line-clamp-3">{p?.description || 'Tidak ada deskripsi.'}</p>
                              
                              <div className="space-y-2 mb-4 bg-white p-3 rounded-xl border border-gray-100">
                                <div className="flex justify-between text-xs font-semibold text-gray-600">
                                  <span>Target Dana</span>
                                  <span className="font-bold text-emerald-600">{formatRupiah(p?.target_funding || 0)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-semibold text-gray-600">
                                  <span>Minimal Donasi</span>
                                  <span className="font-bold text-gray-900">{formatRupiah(p?.min_amount || 0)}</span>
                                </div>
                                {p?.interest_rate ? (
                                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                                    <span>Imbal Hasil/ROI</span>
                                    <span className="font-bold text-indigo-600">{p.interest_rate}%</span>
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => p && handleEditProduct(p)}
                                className="flex-1 text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl border border-gray-200 transition-colors"
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => p && handleHapusProduk(p)}
                                className="flex-1 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl border border-red-100 transition-colors"
                              >
                                HAPUS
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pantau_investasi' && (
                  // Demo Mode: Monitor & Fast-forward customer investments
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-600"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Manajemen Portofolio Nasabah</h2>
                          <p className="text-xs text-gray-500 font-medium">Bypass kunci tenor dan pantau portofolio nasabah ({filteredInvestments.length} Total)</p>
                        </div>
                      </div>
                      <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Cari nasabah atau produk..."
                          value={searchQueryInvestasi}
                          onChange={(e) => {
                            setSearchQueryInvestasi(e.target.value);
                            setCurrentPageInvestasi(1);
                          }}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-900"
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto w-full">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                          <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-4">Nasabah</th>
                            <th className="px-6 py-4">Instrumen Investasi</th>
                            <th className="px-6 py-4">Nominal</th>
                            <th className="px-6 py-4">Suku Bunga</th>
                            <th className="px-6 py-4">Tipe & Status</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {(!filteredInvestments || filteredInvestments.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                                {adminInvestmentsLoading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin text-emerald-500"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                                    <span>Memuat data...</span>
                                  </div>
                                ) : "Tidak ada data investasi ditemukan."}
                              </td>
                            </tr>
                          ) : (
                            paginatedInvestments.map((inv) => (
                              <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors text-gray-900">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-gray-900 text-sm">{inv.nasabah_name}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{inv.nasabah_email}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-bold text-gray-900 text-sm">{inv.name}</div>
                                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {inv.id} | Dibuat: {inv.created_at}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="font-black text-gray-900 text-sm">{"Rp " + new Intl.NumberFormat('id-ID').format(Number(inv.amount))}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="font-bold text-indigo-600 text-sm">{inv.return_rate}% p.a.</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-flex items-center w-max px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${
                                      inv.tipe_investasi === 'liquid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    }`}>
                                      {inv.tipe_investasi === 'liquid' ? 'Liquid' : `Tenor ${inv.tenor_bulan} bln`}
                                    </span>
                                    <span className={`inline-flex items-center w-max px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                                      inv.status === 'active' 
                                        ? (inv.is_locked ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                                        : 'bg-gray-100 text-gray-500 border-gray-200'
                                    }`}>
                                      {inv.status === 'active' 
                                        ? (inv.is_locked ? 'Terkunci' : 'Jatuh Tempo') 
                                        : 'Completed'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {inv.status === 'active' ? (
                                    <button
                                      onClick={() => handleAccelerate(inv)}
                                      className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 ml-auto"
                                    >
                                      <span>Edit Waktu</span>
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">Investasi Selesai</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {totalPagesInvestasi > 1 && (
                      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <span className="text-xs font-medium text-gray-500">
                          Hal {currentPageInvestasi || 1} / {totalPagesInvestasi || 1}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setCurrentPageInvestasi(p => Math.max(1, p - 1))}
                            disabled={currentPageInvestasi === 1}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"></path></svg>
                          </button>
                          <button
                            onClick={() => setCurrentPageInvestasi(p => Math.min(totalPagesInvestasi, p + 1))}
                            disabled={currentPageInvestasi === totalPagesInvestasi}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"></path></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
