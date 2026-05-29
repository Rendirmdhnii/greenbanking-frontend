// FORCE TRIGGER DEPLOYMENT VER MARET 2026 - REVISI UAS FIX FINAL
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Script from "next/script";
import { 
  Wallet, ArrowRightLeft, CreditCard, PieChart, QrCode, Heart, Clock, Plus,
  X, CheckCircle, Loader2, Leaf, ArrowDownLeft, ArrowUpRight, Zap, AlertCircle, Copy, Check
} from "lucide-react";
import Swal from "sweetalert2";
import TransferModal from "@/components/TransferModal";
import StrukModal from "@/components/StrukModal";
import { useUserContext } from "@/hooks/useUserData";
import { formatIDR, copyToClipboard, SwalGreenBanking } from "@/utils/format";

declare global {
  interface Window {
    snap: any;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function DashboardPage() {
  const userHook = useUserContext();
  const { userData, isLoading, syncStatus, isAdmin, userName, userEmail, userBalance, userEcoPoints, userLifetimeEcoPoints, refreshUserData, tier, impactScore, accountNumber } = userHook;
  const [copied, setCopied] = useState(false);

  // Cek Level Tier Poin Dinamis rek
  let maxPoints = 2000;
  let progressText = "Progress Basic";
  let displayTierName = "BASIC";

  if (userLifetimeEcoPoints > 5000) {
    displayTierName = "PRIORITAS";
    maxPoints = 10000; // itung persentase poin 5500 dibagi 10000 ben bar e gak nembus kothak
    progressText = "Progress Prioritas";
  } else if (userLifetimeEcoPoints >= 2001) {
    displayTierName = "PLATINUM";
    maxPoints = 5000;
    progressText = "Progress Platinum";
  }
  
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [strukData, setStrukData] = useState<any>(null);
  const [recentTrx, setRecentTrx] = useState<any[]>([]);
  const [trxLoading, setTrxLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  // Fetch recent transactions from API
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setTrxLoading(false); return; }
        const res = await fetch(`${API_URL}/recent-transactions`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setRecentTrx(data.data || []);
        }
      } catch (e) {
        console.error('Fetch recent transactions error:', e);
      } finally {
        setTrxLoading(false);
      }
    };
    if (!isLoading && syncStatus === 'success') {
      fetchRecent();
    }
  }, [isLoading, syncStatus, strukData]);

  const handleTopUpAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya ambil angka
    const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    setTopUpAmount(rawValue);
  };

  const displayTopUpAmount = topUpAmount ? parseInt(topUpAmount, 10).toLocaleString('id-ID') : '';

  // ═══════════════════════════════════════════════
  //  handleTopUp — nyeluk POST nang /api/checkout
  //  1. Cek duite minimal 10rb
  //  2. njaluk snap_token tekan backend
  //  3. ngetokno popup midtrans
  //  4. nek sukses, tembak api confirm ben saldo nambah
  // ═══════════════════════════════════════════════
  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount);
    
    // ── ojo lali minimal 10ewu bossku ──
    if (!amount || amount < 10000) {
      Swal.fire({ icon: 'warning', title: 'Nominal Terlalu Kecil', text: 'Minimal Top Up adalah Rp 10.000', ...SwalGreenBanking.warning });
      return;
    }

    if (amount > 50000000) {
      Swal.fire({ icon: 'warning', title: 'Batas Maksimal', text: 'Maksimal Top Up untuk simulasi adalah Rp 50.000.000', ...SwalGreenBanking.warning });
      return;
    }

    // ── cek disek midtrans e wes loading ta urung ──
    if (!window.snap) {
      Swal.fire({ icon: 'info', title: 'Memuat Sistem Pembayaran', text: 'Tunggu beberapa detik lalu coba lagi.', ...SwalGreenBanking.info });
      return;
    }

    setTopUpLoading(true);

    try {
      const token = localStorage.getItem('token');

      // ════════════════════════════════════════════
      //  PENTING COY: METHOD e kudu POST (ojo GET!)
      //  lek GET dadi error 405 ngkok mumet ndase
      // ════════════════════════════════════════════
      const res = await fetch(`${API_URL}/checkout`, {
        method: 'POST',                          // ← WAJIB POST
        headers: {
          'Content-Type': 'application/json',     // ← WAJIB JSON
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,     // ← WAJIB Sanctum Token
        },
        body: JSON.stringify({ amount }),          // ← WAJIB body JSON
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          Swal.fire({ icon: 'error', title: 'Sesi Berakhir', text: 'Silakan login ulang.', ...SwalGreenBanking.error });
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || data.message || 'Gagal membuat transaksi', ...SwalGreenBanking.error });
        }
        setTopUpLoading(false);
        return;
      }

      if (data.snap_token) {
        // ════════════════════════════════════════════
        //  Ngetokno popup e Midtrans wkwk
        // ════════════════════════════════════════════
        window.snap.pay(data.snap_token, {
          onSuccess: async (result: any) => { 
            // ── Lapor nang backend nek bar mbayar, cek saldo e dilebokno ──
            try {
              await fetch(`${API_URL}/checkout/confirm`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  order_id: data.order_id,
                  amount: amount,
                }),
              });
            } catch (e) {
              console.error('Confirm error:', e);
            }

            const timeStr = new Date().toLocaleString("id-ID", { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
              hour: '2-digit', minute: '2-digit', second: '2-digit' 
            }) + " WIB";

            setStrukData({
              id: data.order_id || `TOPUP-${Date.now()}`,
              time: timeStr,
              service: 'Top Up Saldo (Midtrans)',
              amount: amount,
              title: 'Struk Top Up Saldo'
            });
            setShowTopUp(false);
            setTopUpAmount('');
            refreshUserData();
          },
          onPending: () => { 
            Swal.fire({ icon: 'info', title: 'Pembayaran Diproses', text: 'Saldo akan masuk otomatis setelah pembayaran selesai.', ...SwalGreenBanking.info }); 
          },
          onError: () => { 
            Swal.fire({ icon: 'error', title: 'Pembayaran Gagal', text: 'Silakan coba lagi.', ...SwalGreenBanking.error }); 
          },
          onClose: () => { 
            console.log('Snap popup ditutup oleh user'); 
            setTopUpLoading(false);
          },
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || 'Token pembayaran tidak ditemukan', ...SwalGreenBanking.error });
      }
    } catch (error) {
      console.error('Top Up error:', error);
      Swal.fire({ icon: 'error', title: 'Koneksi Gagal', text: 'Gagal terhubung ke server. Pastikan backend berjalan.', ...SwalGreenBanking.error });
    } finally {
      setTopUpLoading(false);
    }
  };

  const quickAmounts = [
    { value: 10000,   label: '10rb' },
    { value: 50000,   label: '50rb' },
    { value: 100000,  label: '100rb' },
    { value: 250000,  label: '250rb' },
    { value: 500000,  label: '500rb' },
    { value: 1000000, label: '1jt' },
  ];

  const getTrxIcon = (type: string) => {
    if (type === 'in' || type === 'admin_addition') return <ArrowDownLeft size={16} className="text-green-500" />;
    return <ArrowUpRight size={16} className="text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <img src="/logo.svg" alt="GreenBanking Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-3 text-[#064e3b]">
            <Loader2 className="animate-spin" size={20} />
            <span className="font-medium">Memuat data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Midtrans Snap.js */}
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
        strategy="afterInteractive"
        onReady={() => setSnapReady(true)}
        onError={() => console.error('Gagal memuat Midtrans Snap.js')}
      />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-[#064e3b] font-bold">
            Selamat Datang, {userName.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">{userEmail}</p>
          {syncStatus === 'success' && (
            <div className="flex items-center gap-1.5 mt-2 text-emerald-600">
              <CheckCircle size={14} />
              <span className="text-xs font-medium">Akun Aktif • {tier.toUpperCase()} Tier</span>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
             TOP UP SECTION — Besar, Jelas, dan Fungsional
           ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Card Saldo — Glassmorphism */}
          <div className="bg-gradient-to-br from-[#064e3b] via-[#115e59] to-[#0f766e] text-white p-6 rounded-[24px] shadow-xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -ml-8 -mb-8"></div>
            <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <p className="text-emerald-200 text-sm font-medium mb-1">Saldo Eco-Wallet</p>
              <h2 className="text-3xl font-bold font-serif mb-1 tracking-tight">
                {formatIDR(userBalance)}
              </h2>
              {accountNumber && (
                <button
                  onClick={async () => { await copyToClipboard(accountNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 text-emerald-300/80 text-xs font-mono mb-3 hover:text-white transition-colors group"
                >
                  <span>Rek: {accountNumber}</span>
                  {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} className="opacity-50 group-hover:opacity-100" />}
                </button>
              )}
              <button 
                onClick={() => setShowTopUp(!showTopUp)} 
                className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-[#064e3b] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-white transition-all hover:scale-105 shadow-lg"
              >
                {showTopUp ? <X size={16} /> : <Plus size={16} />}
                {showTopUp ? 'Tutup Top Up' : 'Top Up Saldo'}
              </button>
            </div>
          </div>

          {/* Card Karbon */}
          <div className="bg-[#111827] text-white p-6 rounded-[24px] shadow-lg relative overflow-hidden flex flex-col justify-between border border-gray-800">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#115e59]/20 rounded-full blur-3xl"></div>
            <div>
              <div className="w-10 h-10 bg-gray-800 text-emerald-400 rounded-xl flex items-center justify-center mb-3">
                <Leaf size={20} />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">Pengurangan Karbon</p>
              <h2 className="text-2xl font-bold font-serif text-emerald-400 tracking-tight">{Number(impactScore * 0.5).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg CO2e</h2>
            </div>
            <Link href="/dashboard/investasi" className="mt-3 text-xs text-emerald-400 font-bold hover:underline">
              Tingkatkan Impact ➔
            </Link>
          </div>

          {/* Card Eco Points */}
          <div className="bg-white border border-gray-100 p-6 rounded-[24px] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                <Heart size={20} />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Poin Eco - Tier {displayTierName}</p>
              <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">{userEcoPoints} Poin</h2>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-1">
                <span>{displayTierName === 'PRIORITAS' ? 'Tier Tertinggi Dicapai' : progressText}</span>
                <span>
                  {displayTierName === 'PRIORITAS' 
                    ? `${userLifetimeEcoPoints.toLocaleString('id-ID')} XP (Max Tier)`
                    : `${userLifetimeEcoPoints.toLocaleString('id-ID')} / ${maxPoints.toLocaleString('id-ID')} XP`}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.min((userLifetimeEcoPoints / maxPoints) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
             TOP UP PANEL — Grid Nominal Modern
           ═══════════════════════════════════════════════ */}
        {showTopUp && (
          <div className="bg-white border-2 border-emerald-200 rounded-[24px] p-6 md:p-8 mb-8 shadow-lg shadow-emerald-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-gray-900">Top Up Saldo via Midtrans</h3>
                  <p className="text-sm text-gray-500">Pilih nominal atau masukkan sendiri (min. Rp 10.000)</p>
                </div>
              </div>

              {/* Grid Nominal — Tombol Besar & Kontras */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {quickAmounts.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setTopUpAmount(item.value.toString())}
                    className={`relative py-4 px-3 rounded-2xl text-center font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 ${
                      topUpAmount === item.value.toString()
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200 scale-105'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    {topUpAmount === item.value.toString() && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                        <CheckCircle size={14} className="text-emerald-600" />
                      </div>
                    )}
                    <span className="text-lg">{item.label}</span>
                    <p className={`text-[10px] mt-0.5 ${topUpAmount === item.value.toString() ? 'text-emerald-100' : 'text-gray-400'}`}>
                      Rp {item.value.toLocaleString('id-ID')}
                    </p>
                  </button>
                ))}
              </div>

              {/* Input Custom + Tombol Bayar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Rp</span>
                  <input
                    type="text"
                    placeholder="10.000"
                    value={displayTopUpAmount}
                    onChange={handleTopUpAmountChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-lg font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all placeholder:text-gray-300"
                  />
                </div>
                <button
                  onClick={handleTopUp}
                  disabled={topUpLoading || !topUpAmount}
                  className="bg-emerald-600 text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-emerald-700 transition-all hover:scale-105 hover:shadow-lg shadow-md disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]"
                >
                  {topUpLoading ? (
                    <><Loader2 size={20} className="animate-spin" /> Memproses...</>
                  ) : (
                    <><Zap size={20} /> Bayar Sekarang</>
                  )}
                </button>
              </div>

              {/* Removed Info Banner and Snap Status for cleaner UI */}
            </div>
          </div>
        )}

        {/* Aksi Cepat */}
        <div className="mb-10">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {/* Top Up — Tombol besar standalone */}
            <button onClick={() => setShowTopUp(true)} className="flex flex-col items-center gap-3 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:scale-105 hover:border-emerald-400">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-600 text-white shadow-md">
                <Wallet size={20}/>
              </div>
              <span className="text-xs font-bold text-emerald-700 text-center">Top Up</span>
            </button>
            <button onClick={() => setShowTransferModal(true)} className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
                <ArrowRightLeft size={20}/>
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center">Transfer</span>
            </button>
            {[
              { label: "Tagihan", icon: <CreditCard size={20}/>, color: "bg-orange-50 text-orange-600", href: "/dashboard/tagihan" },
              { label: "Investasi", icon: <PieChart size={20}/>, color: "bg-blue-50 text-blue-600", href: "/dashboard/investasi" },
              { label: "QRIS", icon: <QrCode size={20}/>, color: "bg-emerald-50 text-emerald-600", href: "/dashboard/qris" },
              { label: "Donasi", icon: <Heart size={20}/>, color: "bg-rose-50 text-rose-600", href: "/dashboard/donasi" },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Riwayat Transaksi */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif font-bold text-gray-900">Riwayat Transaksi Terakhir</h3>
            <Link href="/dashboard/riwayat" className="text-sm font-semibold text-[#115e59] hover:underline">Lihat Semua</Link>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            {trxLoading ? (
              <div className="p-4 space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-2 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded-lg w-24" />
                  </div>
                ))}
              </div>
            ) : recentTrx.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="mb-2">Belum ada transaksi.</p>
                <button onClick={() => setShowTopUp(true)} className="text-emerald-600 font-bold hover:underline text-sm">
                  Mulai dengan Top Up! →
                </button>
              </div>
            ) : (
              recentTrx.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-4 px-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTrxIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{tx.title}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full hidden md:inline-block ${(tx.type === 'in' || tx.type === 'admin_addition') ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {tx.status}
                    </span>
                    <span className={`font-bold text-sm ${(tx.type === 'in' || tx.type === 'admin_addition') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {(tx.type === 'in' || tx.type === 'admin_addition') ? '+' : '-'}{formatIDR(tx.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TransferModal 
        isOpen={showTransferModal} 
        onClose={() => setShowTransferModal(false)} 
        onSuccess={(data) => {
          setStrukData(data);
          refreshUserData();
        }}
        serviceType="transfer"
        serviceLabel="Transfer Dana"
        strukTitle="Struk Transfer Dana"
      />
      <StrukModal 
        isOpen={!!strukData} 
        onClose={() => setStrukData(null)} 
        data={strukData} 
      />
    </>
  );
}
