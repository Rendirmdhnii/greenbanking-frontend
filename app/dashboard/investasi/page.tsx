// FORCE TRIGGER DEPLOYMENT VER MARET 2026 - REVISI UAS FIX FINAL
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Loader2, CheckCircle, Zap, MapPin, Clock,
  CloudRain, ShieldCheck, Crown, ChevronDown, ChevronUp, Heart, Leaf
} from "lucide-react";
import StrukModal from "@/components/StrukModal";
import { useUserContext } from "@/hooks/useUserData";
import { formatIDR, formatNumber, SwalGreenBanking } from "@/utils/format";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// --- LOGIKA GAMBAR ANTI-GAGAL (DIPERBARUI & DISTERILKAN) ---
import { globalProjectImages, fallbackImage } from "@/utils/projectImages";

const tagColors: Record<string, string> = {
  "Energi Surya": "bg-amber-100 text-amber-700",
  "Reboisasi Mangrove": "bg-emerald-100 text-emerald-700",
  "Pengolahan Limbah": "bg-purple-100 text-purple-700",
  "Energi Angin": "bg-cyan-100 text-cyan-700",
  "Konservasi Laut": "bg-blue-100 text-blue-700",
  "Bio-Gas": "bg-orange-100 text-orange-700",
};

export default function InvestasiPage() {
  const { userBalance, refreshUserData } = useUserContext();
  
  type GreenProduct = {
    id: string;
    product_id?: string;
    title: string;
    tag: string;
    image?: string | null;
    image_url?: string | null;
    location?: string;
    description?: string;
    min_amount: number;
    interest_rate?: number | null;
    current_funding: number;
    target_funding: number;
    days_left?: number | null;
    status_badge?: string | null;
    impact_co2e?: number | null;
    carbon_impact?: number | null;
    tipe_investasi?: string;
    tenor_bulan?: number;
    category?: string;
    type?: string;
    tenor_months?: number;
    has_invested?: boolean;
  };

  type StrukData = {
    id: string;
    title: string;
    service: string;
    amount: number;
    time: string;
  };

  const [products, setProducts] = useState<GreenProduct[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [portLoading, setPortLoading] = useState(false);
  const [investLoading, setInvestLoading] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [strukData, setStrukData] = useState<StrukData | null>(null);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'katalog' | 'portofolio'>('katalog');

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/products`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products || []);
      }
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      setLoading(false);
    }
  };

  // Load Portofolio User
  const fetchPortfolios = async () => {
    setPortLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/investments`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const d = await res.json();
        setPortfolios(d.investments || []);
      }
    } catch (e) {
      console.error("Error fetching portfolios:", e);
    } finally {
      setPortLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPortfolios();
  }, []);

  const handleInvest = async (p: GreenProduct) => {
    const amt = parseInt(amounts[p.id] || "") || p.min_amount;
    const isDonasi = p.tipe_investasi === 'donasi';
    if (amt < p.min_amount) { 
      Swal.fire({ 
        icon: 'warning', 
        title: 'Nominal Kurang', 
        text: `Minimal ${isDonasi ? 'donasi' : 'investasi'} ${formatIDR(p.min_amount)}`, 
        ...SwalGreenBanking.warning 
      }); 
      return; 
    }
    if (amt > userBalance) { 
      Swal.fire({ 
        icon: 'warning', 
        title: 'Saldo Tidak Mencukupi', 
        text: 'Silakan Top Up terlebih dahulu.', 
        ...SwalGreenBanking.warning 
      }); 
      return; 
    }

    setInvestLoading(p.id);

    // Tampilkan SweetAlert2 untuk minta PIN Transaksi
    const { value: pin, isDismissed } = await Swal.fire({
      title: 'Masukkan PIN Transaksi',
      input: 'password',
      inputLabel: 'Masukkan 6-Digit PIN Transaksi GreenBanking Anda',
      inputPlaceholder: '••••••',
      inputAttributes: {
        maxlength: '6',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Verifikasi',
      cancelButtonText: 'Batal',
      customClass: {
        container: 'backdrop-blur-sm bg-black/40',
        popup: 'rounded-3xl shadow-xl p-6 font-sans',
        input: 'text-center text-4xl tracking-[1.5em] pl-[1.6em] font-bold py-3 bg-transparent border-t-0 border-x-0 border-b-2 border-gray-300 focus:border-emerald-600 focus:ring-0 outline-none transition-all text-gray-900 max-w-xs mx-auto focus:outline-none',
        confirmButton: 'px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg outline-none border-0 cursor-pointer flex-1',
        cancelButton: 'px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl transition-all duration-200 outline-none border-0 cursor-pointer flex-1',
        actions: 'flex gap-3 w-full justify-center mt-4'
      },
      buttonsStyling: false,
      inputValidator: (value) => {
        if (!value) {
          return 'PIN tidak boleh kosong!';
        }
        if (value.length !== 6) {
          return 'PIN harus 6 digit!';
        }
      }
    });

    if (isDismissed || !pin) {
      setInvestLoading(null);
      return;
    }

    Swal.fire({
      title: isDonasi ? 'Memproses Donasi' : 'Memproses Investasi',
      text: 'Mohon tunggu sebentar...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const token = localStorage.getItem("token");
      const endpoint = isDonasi ? `${API_URL}/donate` : `${API_URL}/invest`;
      const body = isDonasi
        ? JSON.stringify({ name: p.title, type: p.product_id || String(p.id), amount: Number(amt), pin: pin })
        : JSON.stringify({ investment_id: p.id, type: "investment", amount: Number(amt), pin: pin });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: body,
      });
      const data = await res.json();

      if (!res.ok) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || data.message || (isDonasi ? 'Gagal donasi' : 'Gagal investasi'), ...SwalGreenBanking.error });
        return;
      }

      Swal.close();

      setStrukData({
        id: data.transaction_id, title: isDonasi ? "Struk Donasi Lingkungan" : "Struk Investasi Hijau",
        service: isDonasi ? `Donasi: ${p.title}` : `Investasi: ${p.title}`, amount: amt,
        time: new Date().toLocaleString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) + " WIB",
      });
      
      setProducts(prevProducts => 
        prevProducts.map(prod => 
          prod.id === p.id 
            ? { ...prod, current_funding: Number(prod.current_funding) + Number(amt) } 
            : prod
        )
      );

      setAmounts(prev => ({ ...prev, [p.id]: "" }));
      setExpandedCard(null);
      refreshUserData();
      fetchPortfolios(); // Muat ulang portofolio setelah berhasil
    } catch { 
      Swal.fire({ icon: 'error', title: 'Koneksi Gagal', text: 'Gagal terhubung ke server.', ...SwalGreenBanking.error }); 
    } finally { 
      setInvestLoading(null); 
    }
  };

  // Fungsi Pencairan Portofolio (Tarik Uang)
  const onWithdraw = async (portfolioId: number) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Konfirmasi Pencairan',
      text: 'Apakah Anda yakin ingin mencairkan investasi ini kembali ke saldo utama?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Cairkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#d33',
      background: '#ffffff',
      color: '#111827',
    });

    if (!isConfirmed) return;

    Swal.fire({
      title: 'Memproses Pencairan...',
      text: 'Mohon tunggu sebentar...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/invest/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ portofolio_id: portfolioId }),
      });
      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: data.message || 'Gagal mencairkan investasi.',
          confirmButtonColor: '#dc2626',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Pencairan Berhasil!',
        text: 'Dana investasi dan imbal hasil telah sukses dikirim ke saldo utama.',
        confirmButtonColor: '#059669',
      });

      refreshUserData();
      fetchPortfolios();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Gagal',
        text: 'Gagal menghubungkan ke server.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const tags = ["Semua", ...Array.from(new Set(products.map(p => p.tag).filter(Boolean)))];
  const filtered = activeFilter === "Semua" ? products : products.filter(p => p.tag === activeFilter);
  const liquidProducts = filtered.filter(p => p.type === 'investasi' && (!p.tenor_months || p.tenor_months === 0));
  const tenorProducts = filtered.filter(p => p.type === 'investasi' && p.tenor_months! > 0);
  const donationProducts = filtered.filter(p => p.type === 'donasi');

  const renderProductCard = (p: GreenProduct, i: number) => {
    const progress = p.target_funding > 0 ? (p.current_funding / p.target_funding) * 100 : 0;
    const isExpanded = expandedCard === p.id;
    
    // Resolusi gambar: prioritaskan image_url dari API Backend
    // Jika path /storage (upload lokal), prepend backend host
    // Jika kosong, gunakan globalProjectImages berdasarkan judul, lalu fallbackImage
    let currentImg = p.image_url || p.image || null;
    if (currentImg && currentImg.startsWith('/storage')) {
      const backendHost = API_URL.replace(/\/api$/, '');
      currentImg = `${backendHost}${currentImg}`;
    }
    if (!currentImg) {
      currentImg = globalProjectImages[p.title] || fallbackImage;
    }
    const isDonasi = p.type === 'donasi';

    return (
      <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
        className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
      >
        {/* --- IMAGE HEADER --- */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={currentImg}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = globalProjectImages[p.title] || fallbackImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badge: Terverifikasi / Hasil Premium */}
          {p.status_badge && (
            <div className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 ${p.status_badge === "Hasil Premium"
              ? "bg-amber-400 text-amber-900"
              : "bg-white text-emerald-700"
              }`}>
              {p.status_badge === "Hasil Premium" ? <Crown size={10} /> : <ShieldCheck size={10} />}
              {p.status_badge}
            </div>
          )}

          {/* Tag kategori */}
          {p.tag && (
            <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${tagColors[p.tag] || "bg-gray-100 text-gray-600"}`}>
              {p.tag}
            </div>
          )}

          {/* ROI besar */}
          {!isDonasi && (
            <div className="absolute bottom-3 left-4">
              <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">ROI</p>
              <p className="text-white text-2xl font-bold drop-shadow-lg">{p.interest_rate}%<span className="text-sm text-white/60 ml-1">p.a.</span></p>
            </div>
          )}
        </div>

        {/* --- BODY --- */}
        <div className="p-5">
          {/* Visual Badge Tipe Investasi */}
          <div className="mb-3">
            {isDonasi ? (
              <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                DONASI - Peduli Lingkungan
              </span>
            ) : (!p.tipe_investasi || p.tipe_investasi === 'liquid' || p.tenor_bulan === 0) ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                LIQUID - Fleksibel
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                TENOR {p.tenor_bulan} BULAN
              </span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug">{p.title}</h3>
          {p.location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-3"><MapPin size={12} />{p.location}</p>
          )}
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.description}</p>

          {/* --- FINTECH BANKING INFO GRID --- */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100/80">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isDonasi ? 'Tipe Proyek' : 'Imbal Hasil (Bunga)'}</p>
              {isDonasi ? (
                <p className="text-rose-600 text-xs font-black mt-1 uppercase tracking-wider">Sumbangan Sosial</p>
              ) : (
                <p className="text-emerald-600 text-lg font-black">{p.interest_rate ?? 0}% <span className="text-xs font-bold text-gray-500">p.a.</span></p>
              )}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Min. Transaksi</p>
              <p className="text-gray-900 text-sm font-black mt-0.5">{formatIDR(p.min_amount)}</p>
            </div>
          </div>

          {/* --- FOOTER STATS --- */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pb-4 border-b border-gray-50">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CloudRain size={12} className="text-emerald-500" /> Dampak: {p.impact_co2e ?? 0} Ton CO2e
            </span>
          </div>

          {/* --- EXPAND / INVEST --- */}
          <button onClick={() => setExpandedCard(isExpanded ? null : p.id)}
            disabled={progress >= 100 || p.has_invested}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${progress >= 100 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : p.has_invested ? 'bg-gray-300 text-gray-400 cursor-not-allowed border border-gray-200' : isDonasi ? 'bg-rose-700 text-white hover:bg-rose-800' : 'bg-[#064e3b] text-white hover:bg-[#065f46]'}`}
          >
            {progress >= 100 ? "Kuota Penuh" : p.has_invested ? "Portofolio Aktif" : (
              <>
                {isDonasi ? <Heart size={14} /> : <Zap size={14} />} 
                {isDonasi ? "Donasi Sekarang" : "Investasi Sekarang"}
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </>
            )}
          </button>

          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 space-y-2 overflow-hidden">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                  <input type="text" placeholder={formatIDR(p.min_amount).replace('Rp ', '')}
                    value={amounts[p.id] ? parseInt(amounts[p.id], 10).toLocaleString('id-ID') : ""}
                    onChange={e => {
                      const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                      setAmounts(prev => ({ ...prev, [p.id]: rawValue }));
                    }}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <button onClick={() => handleInvest(p)} disabled={investLoading === p.id}
                  className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  {investLoading === p.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {investLoading === p.id ? "..." : "Bayar"}
                </button>
              </div>
              <p className="text-[10px] text-gray-400">Min. {formatIDR(p.min_amount)} | Potong langsung dari saldo utama</p>

              {(() => {
                const investmentAmount = parseInt(amounts[p.id] || "0", 10) || 0;
                const carbonImpact = (p.carbon_impact ?? p.impact_co2e ?? 25) || 25;
                const estimatedImpact = (investmentAmount / 1000000) * carbonImpact;
                const estimatedTrees = Math.round(estimatedImpact / 12);
                if (investmentAmount <= 0) return null;

                return (
                  <div className="mt-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                    <p className="text-xs font-bold text-[#064e3b]">Kalkulator Dampak Karbon</p>
                    <p className="text-xs text-emerald-700">
                      Estimasi Dampak:{" "}
                      <span className="font-bold">{estimatedImpact.toFixed(2)} kg CO2e</span> / setara{" "}
                      <span className="font-bold">{estimatedTrees}</span> pohon
                    </p>
                  </div>
                );
              })()}</motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-emerald-600" size={32} />
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-7xl mx-auto w-full">

        {/* === HERO === */}
        <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#0f766e] rounded-[2rem] p-8 md:p-10 mb-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/10 rounded-full blur-2xl -ml-12 -mb-12" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-emerald-300" />
              <span className="text-emerald-200 font-bold text-xs tracking-[0.2em] uppercase">Pasar Investasi Hijau</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Investasi Berdampak, Hasil Nyata.</h1>
            <p className="text-emerald-100/70 max-w-xl text-sm">{products.length} produk investasi terverifikasi. Setiap rupiah Anda mendanai proyek hijau dan menghasilkan return kompetitif.</p>
            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                <p className="text-emerald-200 text-[10px] font-semibold uppercase tracking-wider">Saldo Utama</p>
                <p className="font-bold text-lg">{formatIDR(userBalance)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                <p className="text-emerald-200 text-[10px] font-semibold uppercase tracking-wider">Total Produk</p>
                <p className="font-bold text-lg">{products.length} Instrumen</p>
              </div>
            </div>
          </div>
        </div>

        {/* === SUB-TAB NAVIGATION === */}
        <div className="flex gap-6 border-b border-gray-200 mb-8 pb-0.5">
          <button
            onClick={() => setActiveSubTab('katalog')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeSubTab === 'katalog' ? 'text-emerald-700 font-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Pilihan Investasi (Katalog)
            {activeSubTab === 'katalog' && (
              <motion.div layoutId="subtab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('portofolio')}
            className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
              activeSubTab === 'portofolio' ? 'text-emerald-700 font-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Portofolio Aktif Saya
            {portfolios.filter(p => p.status === 'active').length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                {portfolios.filter(p => p.status === 'active').length}
              </span>
            )}
            {activeSubTab === 'portofolio' && (
              <motion.div layoutId="subtab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
        </div>

        {/* === VIEW 1: KATALOG PRODUK === */}
        {activeSubTab === 'katalog' && (
          <>
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto my-12 w-full">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="text-gray-300 animate-pulse" size={28} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Belum ada produk yang tersedia</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Saat ini belum ada produk investasi atau donasi hijau yang tersedia.</p>
              </div>
            ) : (
              <>
                {/* === FILTER TAGS === */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {tags.map(tag => (
                <button key={tag} onClick={() => setActiveFilter(tag)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === tag
                    ? "bg-[#064e3b] text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                >{tag}</button>
              ))}
            </div>

            {/* === SECTION 1: LIQUID PRODUCTS === */}
            <div className="mb-12">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
                Investasi Likuid (Pencairan Fleksibel)
              </h2>
              {liquidProducts.length === 0 ? (
                <div className="bg-gray-50/50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 font-medium">Tidak ada instrumen investasi Liquid aktif saat ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liquidProducts.map((p, i) => renderProductCard(p, i))}
                </div>
              )}
            </div>

            {/* === SECTION 2: TENOR PRODUCTS === */}
            <div className="mb-12">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
                Investasi Tenor (Berjangka - Bunga Lebih Tinggi)
              </h2>
              {tenorProducts.length === 0 ? (
                <div className="bg-gray-50/50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 font-medium">Tidak ada instrumen investasi Tenor aktif saat ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tenorProducts.map((p, i) => renderProductCard(p, i))}
                </div>
              )}
            </div>

            {/* === SECTION 3: DONATION PRODUCTS === */}
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
                Donasi Hijau (Dukung Proyek Lingkungan)
              </h2>
              {donationProducts.length === 0 ? (
                <div className="bg-gray-50/50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 font-medium">Tidak ada program donasi aktif saat ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {donationProducts.map((p, i) => renderProductCard(p, i))}
                </div>
              )}
            </div>
          </>
        )}
      </>
    )}

        {/* === VIEW 2: PORTOFOLIO AKTIF === */}
        {activeSubTab === 'portofolio' && (
          <div className="w-full">
            {portLoading ? (
              <div className="p-12 flex items-center justify-center min-h-[40vh]">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
              </div>
            ) : portfolios.filter(p => p.status === 'active').length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="text-gray-300" size={28} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Belum Ada Investasi Aktif</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">Anda tidak memiliki dana di portofolio investasi saat ini. Silakan buka katalog produk untuk menanamkan modal dan menyokong proyek hijau.</p>
                <button
                  onClick={() => setActiveSubTab('katalog')}
                  className="px-6 py-3 bg-[#064e3b] text-white hover:bg-[#065f46] rounded-xl font-bold text-sm transition-all"
                >
                  Jelajahi Katalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.filter(p => p.status === 'active').map((item, i) => {
                  const isLiquid = item.tipe_investasi === 'liquid' || item.tenor_bulan === 0;
                  const canWithdraw = !item.is_locked;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all group"
                    >
                      <div>
                        {/* Header Kartu */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isLiquid ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {isLiquid ? 'Liquid (Fleksibel)' : 'Tenor (Berjangka)'}
                            </span>
                            <h3 className="font-bold text-gray-900 text-base mt-2 leading-snug">{item.name}</h3>
                          </div>
                          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                            ROI {item.return_rate}% p.a.
                          </span>
                        </div>

                        {/* Statistik Finansial */}
                        <div className="space-y-3 my-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-500">Nominal Pokok</span>
                            <span className="font-bold text-gray-900">{formatIDR(item.amount)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-500">Bunga Berjalan ({Math.floor(item.days_passed || 0)} Hari)</span>
                            <span className="font-bold text-emerald-600">+Rp {new Intl.NumberFormat('id-ID').format(Math.floor(item.estimasi_profit || 0))}</span>
                          </div>
                          {item.tgl_jatuh_tempo && (
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-gray-500">Tanggal Jatuh Tempo</span>
                              <span className="font-bold text-gray-900">
                                {new Date(item.tgl_jatuh_tempo).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tombol Tarik Uang */}
                      <div className="mt-4">
                        {canWithdraw ? (
                          <div className="space-y-2">
                            <button
                              onClick={() => onWithdraw(item.id)}
                              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100"
                            >
                              Tarik Uang
                            </button>
                            <p className="text-[10px] text-center text-emerald-600 font-bold">
                              Bunga {item.return_rate}% p.a. - Bisa ditarik kapanpun
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              disabled
                              className="w-full py-3.5 bg-gray-100 text-gray-400 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-not-allowed border border-gray-200/50"
                            >
                              <span>Tarik Uang (Terkunci)</span>
                            </button>
                            <p className="text-[10px] text-center text-gray-400 font-bold">
                              Bunga {item.return_rate}% p.a. - Terkunci {item.tenor_bulan} bulan
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </motion.div>

      <StrukModal isOpen={!!strukData} onClose={() => setStrukData(null)} data={strukData} />
    </>
  );
}
