"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart, Loader2, Droplets, GraduationCap, TreePine, Zap, Target
} from "lucide-react";
import StrukModal from "@/components/StrukModal";
import { useUserContext } from "@/hooks/useUserData";
import { formatIDR, SwalGreenBanking } from "@/utils/format";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const fallbackDonasi = "/images/default-project.jpg";

const iconMap: Record<string, React.ReactNode> = {
  mangrove_restore: <TreePine size={20} />,
  clean_water: <Droplets size={20} />,
  eco_education: <GraduationCap size={20} />,
};

const quickAmounts = [10000, 25000, 50000, 100000, 250000];

export default function DonasiPage() {
  const { userBalance, refreshUserData, totalDonation } = useUserContext();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [donateLoading, setDonateLoading] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [strukData, setStrukData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/products`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(r => r.json())
      .then(d => {
        const allProducts = d.products || [];
        setProducts(allProducts.filter((p: any) => p.type === 'donasi'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDonate = async (product: any) => {
    const amt = parseInt(amounts[product.id] || '') || product.min_amount;
    if (amt < product.min_amount) {
      Swal.fire({ icon: 'warning', title: 'Nominal Kurang', text: `Minimal donasi ${formatIDR(product.min_amount)}`, ...SwalGreenBanking.warning });
      return;
    }
    if (amt > userBalance) {
      Swal.fire({ icon: 'warning', title: 'Saldo Tidak Mencukupi', text: 'Silakan Top Up terlebih dahulu.', ...SwalGreenBanking.warning });
      return;
    }

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
      return;
    }

    setDonateLoading(product.id);
    Swal.fire({
      title: 'Memproses Donasi',
      text: 'Mohon tunggu sebentar...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: product.title, type: product.product_id || String(product.id), amount: amt, pin: pin }),
      });
      const data = await res.json();
      if (!res.ok) { Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || data.message || 'Gagal donasi', ...SwalGreenBanking.error }); return; }

      Swal.close();

      setStrukData({
        id: data.transaction_id, title: 'Struk Donasi Lingkungan',
        service: `Donasi: ${product.title}`,
        amount: amt,
        time: new Date().toLocaleString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
      });
      setAmounts(prev => ({ ...prev, [product.id]: '' }));
      refreshUserData();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Koneksi Gagal', text: 'Gagal terhubung ke server.', ...SwalGreenBanking.error });
    } finally {
      setDonateLoading(null);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-rose-500" size={32} />
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Hero */}
        <div className="bg-gradient-to-br from-rose-700 to-[#064e3b] rounded-[2rem] p-8 md:p-10 mb-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-400/10 rounded-full blur-2xl -ml-10 -mb-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={20} className="text-rose-300 fill-rose-300" />
              <span className="text-rose-200 font-bold text-sm tracking-widest uppercase">Donasi Lingkungan</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Setiap Rupiah Berarti untuk Bumi Kita.</h1>
            <p className="text-white/70 max-w-xl">3 program donasi berdampak tinggi. Kontribusi Anda langsung tercatat di database dan menambah Impact Score.</p>
            <div className="mt-5 flex items-center gap-4 flex-wrap">
              <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl">
                <p className="text-rose-200 text-xs">Saldo Tersedia</p>
                <p className="font-bold text-lg">{formatIDR(userBalance)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl">
                <p className="text-emerald-200 text-xs">Total Donasi Anda</p>
                <p className="font-bold text-lg">{formatIDR(totalDonation)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Produk Donasi — murni dari API, tidak ada hardcode */}
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto my-12 w-full">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-gray-300 animate-pulse" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Belum ada produk yang tersedia</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Saat ini belum ada produk donasi hijau yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p, i) => {
              const progress = p.target_funding > 0 ? (p.current_funding / p.target_funding) * 100 : 0;
              // Resolusi gambar: prioritaskan image_url dari API Backend
              let displayImage = (p.image_url && p.image_url !== 'null' && p.image_url !== '')
                ? p.image_url
                : fallbackDonasi;

              if (displayImage && displayImage.startsWith('/storage')) {
                const backendHost = API_URL.replace(/\/api$/, '');
                displayImage = `${backendHost}${displayImage}`;
              } else if (displayImage && !displayImage.startsWith('http') && !displayImage.startsWith('/images/')) {
                const backendHost = API_URL.replace(/\/api$/, '');
                displayImage = `${backendHost}/storage/${displayImage}`;
              }
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={displayImage ? (displayImage.includes('?') ? `${displayImage}&t=${p.updated_at ? encodeURIComponent(p.updated_at) : Date.now()}` : `${displayImage}?t=${p.updated_at ? encodeURIComponent(p.updated_at) : Date.now()}`) : undefined}
                      onError={(e) => { e.currentTarget.src = fallbackDonasi; }}
                      alt={p.title}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                      <Target size={10} /> {p.target_impact}
                    </div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-white font-bold text-lg drop-shadow">{p.title}</h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">{p.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1 text-rose-500 font-bold">{iconMap[p.id] || <Heart size={14} />} Impact</span>
                      <span>Min. {formatIDR(p.min_amount)}</span>
                    </div>

                    {/* Quick amount pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {quickAmounts.filter(a => a >= p.min_amount).slice(0, 4).map(a => (
                        <button key={a} onClick={() => setAmounts(prev => ({ ...prev, [p.id]: a.toString() }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${amounts[p.id] === a.toString()
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                            }`}
                        >
                          {a >= 1000000 ? `${a / 1000000}jt` : `${a / 1000}rb`}
                        </button>
                      ))}
                    </div>

                    {/* Input + Button */}
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                        <input
                          type="text" placeholder={p.min_amount.toLocaleString("id-ID")}
                          value={amounts[p.id] ? parseInt(amounts[p.id], 10).toLocaleString('id-ID') : ''}
                          onChange={e => {
                            const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                            setAmounts(prev => ({ ...prev, [p.id]: rawValue }));
                          }}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                        />
                      </div>
                      <button
                        onClick={() => handleDonate(p)}
                        disabled={donateLoading === p.id || progress >= 100 || p.has_invested}
                        className={`text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 ${progress >= 100 ? 'bg-gray-400 cursor-not-allowed' : p.has_invested ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-200' : 'bg-rose-500 hover:bg-rose-600 hover:scale-105 disabled:opacity-50'}`}
                      >
                        {progress >= 100 ? "Pendanaan Selesai" : p.has_invested ? "Sudah Diikuti" : (
                          <>
                            {donateLoading === p.id ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} />}
                            {donateLoading === p.id ? '...' : 'Donasi Sekarang'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      <StrukModal isOpen={!!strukData} onClose={() => setStrukData(null)} data={strukData} />
    </>
  );
}
