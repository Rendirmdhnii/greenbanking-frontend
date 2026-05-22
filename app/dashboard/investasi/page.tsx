"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Loader2, CheckCircle, Zap, MapPin, Clock,
  CloudRain, ShieldCheck, Crown, ChevronDown, ChevronUp
} from "lucide-react";
import StrukModal from "@/components/StrukModal";
import { useUserContext } from "@/hooks/useUserData";
import { formatIDR, SwalGreenBanking } from "@/utils/format";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// --- LOGIKA GAMBAR ANTI-GAGAL (DIPERBARUI & DISTERILKAN) ---
import { globalProjectImages, fallbackImage } from "@/utils/projectImages";

// --- VISUAL DIVERSITY: VARIASI AGAR TIDAK KEMBAR ---




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
  };

  type StrukData = {
    id: string;
    title: string;
    service: string;
    amount: number;
    time: string;
  };

  const [products, setProducts] = useState<GreenProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [investLoading, setInvestLoading] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [strukData, setStrukData] = useState<StrukData | null>(null);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/green-products?category=investment`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleInvest = async (p: GreenProduct) => {
    const amt = parseInt(amounts[p.id] || "") || p.min_amount;
    if (amt < p.min_amount) { Swal.fire({ icon: 'warning', title: 'Nominal Kurang', text: `Minimal investasi ${formatIDR(p.min_amount)}`, ...SwalGreenBanking.warning }); return; }
    if (amt > userBalance) { Swal.fire({ icon: 'warning', title: 'Saldo Tidak Mencukupi', text: 'Silakan Top Up terlebih dahulu.', ...SwalGreenBanking.warning }); return; }

    setInvestLoading(p.id);
    Swal.fire({
      title: 'Memproses Investasi',
      text: 'Mohon tunggu sebentar...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/invest`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ investment_id: p.id, type: "investment", amount: Number(amt) }),
      });
      const data = await res.json();

      if (!res.ok) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.message || 'Gagal investasi', ...SwalGreenBanking.error });
        return;
      }

      Swal.close();

      setStrukData({
        id: data.transaction_id, title: "Struk Investasi Hijau",
        service: `Investasi: ${p.title}`, amount: amt,
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
    } catch { Swal.fire({ icon: 'error', title: 'Koneksi Gagal', text: 'Gagal terhubung ke server.', ...SwalGreenBanking.error }); }
    finally { setInvestLoading(null); }
  };

  const tags = ["Semua", ...Array.from(new Set(products.map(p => p.tag).filter(Boolean)))];
  const filtered = activeFilter === "Semua" ? products : products.filter(p => p.tag === activeFilter);

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
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Investasi Berdampak, Hasil Nyata.</h1>
            <p className="text-emerald-100/70 max-w-xl text-sm">{products.length} produk investasi terverifikasi. Setiap rupiah Anda mendanai proyek hijau dan menghasilkan return kompetitif.</p>
            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                <p className="text-emerald-200 text-[10px] font-semibold uppercase tracking-wider">Saldo</p>
                <p className="font-bold text-lg">{formatIDR(userBalance)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                <p className="text-emerald-200 text-[10px] font-semibold uppercase tracking-wider">Total Produk</p>
                <p className="font-bold text-lg">{products.length} Instrumen</p>
              </div>
            </div>
          </div>
        </div>

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

        {/* === GRID PRODUK DINAMIS === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => {
            const progress = p.target_funding > 0 ? (p.current_funding / p.target_funding) * 100 : 0;
            const isExpanded = expandedCard === p.id;
            const currentImg = globalProjectImages[p.title] || fallbackImage;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
              >
                {/* --- IMAGE HEADER --- */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={currentImg}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
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
                  <div className="absolute bottom-3 left-4">
                    <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">ROI</p>
                    <p className="text-white text-2xl font-bold drop-shadow-lg">{p.interest_rate}%<span className="text-sm text-white/60 ml-1">p.a.</span></p>
                  </div>
                </div>

                {/* --- BODY --- */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug">{p.title}</h3>
                  {p.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-3"><MapPin size={12} />{p.location}</p>
                  )}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.description}</p>

                  {/* --- PROGRESS BAR --- */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-gray-500">Terkumpul: {formatIDR(p.current_funding)}</span>
                      <span className="text-gray-400">Target Dana: {formatIDR(p.target_funding)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-2 rounded-full ${progress >= 80 ? "bg-emerald-500" : progress >= 50 ? "bg-emerald-400" : "bg-emerald-300"}`}
                      />
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">{Math.min(progress, 100).toFixed(1)}% Terdanai</p>
                  </div>

                  {/* --- FOOTER STATS --- */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pb-4 border-b border-gray-50">
                    <span className="flex items-center gap-1"><Clock size={12} />{p.days_left} Hari Lagi</span>
                    <span className="flex items-center gap-1"><CloudRain size={12} />{p.impact_co2e} Ton CO2e</span>
                  </div>

                  {/* --- EXPAND / INVEST --- */}
                  <button onClick={() => setExpandedCard(isExpanded ? null : p.id)}
                    disabled={progress >= 100}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${progress >= 100 ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#064e3b] text-white hover:bg-[#065f46]'}`}
                  >
                    {progress >= 100 ? "🔒 Pendanaan Selesai" : (
                      <>
                        <Zap size={14} /> Investasi Sekarang
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
          })}
        </div>
      </motion.div>

      <StrukModal isOpen={!!strukData} onClose={() => setStrukData(null)} data={strukData} />
    </>
  );
}
