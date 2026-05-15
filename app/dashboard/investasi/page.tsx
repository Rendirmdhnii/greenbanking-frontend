"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Loader2, CheckCircle, Zap, Leaf, MapPin, Clock,
  CloudRain, ShieldCheck, Crown, ChevronDown, ChevronUp
} from "lucide-react";
import StrukModal from "@/components/StrukModal";
import { useUserContext } from "@/hooks/useUserData";
import { formatIDR, SwalGreenBanking } from "@/utils/format";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// ─── LOGIKA GAMBAR ANTI-GAGAL (DIPERBARUI) ───
const fallbackImages: Record<string, string> = {
  // Prioritas 1: Berdasarkan Judul Spesifik
  "Restorasi Mangrove Probolinggo": "https://images.unsplash.com/photo-1621450259223-233e7022d274?auto=format&fit=crop&w=800&q=80",

  // Prioritas 2: Berdasarkan Tag/Kategori
  "Energi Surya": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80",
  "Energi": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80",
  "Reboisasi Mangrove": "https://images.unsplash.com/photo-1584301287561-5770751?auto=format&fit=crop&w=800&q=80",
  "Kehutanan": "https://images.unsplash.com/photo-1584301287561-5770751?auto=format&fit=crop&w=800&q=80",
  "Pengolahan Limbah": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
  "Limbah": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
  "Energi Angin": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
  "Konservasi Laut": "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=800&q=80",
  "Bio-Gas": "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=800&q=80",
};

const defaultFallback = "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80";

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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [investLoading, setInvestLoading] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [strukData, setStrukData] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/green-products?category=investment`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleInvest = async (p: any) => {
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

        {/* ═══ HERO ═══ */}
        <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#0f766e] rounded-[2rem] p-8 md:p-10 mb-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/10 rounded-full blur-2xl -ml-12 -mb-12" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-emerald-300" />
              <span className="text-emerald-200 font-bold text-xs tracking-[0.2em] uppercase">Pasar Investasi Hijau</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Investasi Berdampak, Hasil Nyata.</h1>
            <p className="text-emerald-100/70 max-w-xl text-sm">9 produk investasi terverifikasi. Setiap rupiah Anda mendanai proyek hijau dan menghasilkan return kompetitif.</p>
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

        {/* ═══ FILTER TAGS ═══ */}
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

        {/* ═══ GRID 9 PRODUK ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => {
            const progress = p.target_funding > 0 ? (p.current_funding / p.target_funding) * 100 : 0;
            const isExpanded = expandedCard === p.id;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
              >
                {/* ─── IMAGE HEADER ─── */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    // LOGIKA DEWA: 1. Judul -> 2. Tag -> 3. Image DB -> 4. Default Fallback
                    src={fallbackImages[p.title] || fallbackImages[p.tag] || p.image || defaultFallback}
                    onError={(e) => {
                      e.currentTarget.onerror = null; // Cegah error looping
                      e.currentTarget.src = defaultFallback;
                    }}
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

                {/* ─── BODY ─── */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug">{p.title}</h3>
                  {p.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-3"><MapPin size={12} />{p.location}</p>
                  )}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.description}</p>

                  {/* ─── PROGRESS BAR ─── */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-gray-500">{formatIDR(p.current_funding)}</span>
                      <span className="text-gray-400">Target {formatIDR(p.target_funding)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-2 rounded-full ${progress >= 80 ? "bg-emerald-500" : progress >= 50 ? "bg-emerald-400" : "bg-emerald-300"}`}
                      />
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">{progress.toFixed(1)}% Terdanai</p>
                  </div>

                  {/* ─── FOOTER STATS ─── */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pb-4 border-b border-gray-50">
                    <span className="flex items-center gap-1"><Clock size={12} />{p.days_left} Hari Lagi</span>
                    <span className="flex items-center gap-1"><CloudRain size={12} />{p.impact_co2e}t CO₂e</span>
                  </div>

                  {/* ─── EXPAND / INVEST ─── */}
                  <button onClick={() => setExpandedCard(isExpanded ? null : p.id)}
                    className="w-full bg-[#064e3b] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#065f46] transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={14} /> Investasi Sekarang
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                      <p className="text-[10px] text-gray-400">Min. {formatIDR(p.min_amount)} • Potong langsung dari saldo utama</p>
                    </motion.div>
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