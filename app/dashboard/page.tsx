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
import WalletBalanceCard from "@/components/WalletBalanceCard";
import TopUpModal from "@/components/TopUpModal";
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
  let maxPoints = 10000;
  let progressText = "Progress Basic";
  let displayTierName = "BASIC";

  if (userLifetimeEcoPoints >= 50000) {
    displayTierName = "PLATINUM";
    maxPoints = 50000; 
    progressText = "Progress Platinum";
  } else if (userLifetimeEcoPoints >= 10000) {
    displayTierName = "PRIORITAS";
    maxPoints = 50000;
    progressText = "Progress Prioritas";
  }
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

  // ═══════════════════════════════════════════════
  //  handleTopUp — nyeluk POST nang /api/checkout
  //  1. Cek duite minimal 10rb
  //  2. njaluk snap_token tekan backend
  //  3. ngetokno popup midtrans
  //  4. nek sukses, tembak api confirm ben saldo nambah
  // ═══════════════════════════════════════════════
  const handleTopUp = async (amount: number) => {
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
              service: 'Top Up Saldo',
              amount: amount,
              title: 'Struk Top Up Saldo'
            });
            setShowTopUp(false);
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

  // Menggunakan data transaksi riwayat dinamis saja

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
        <div className="mb-8 flex flex-col gap-1 items-start">
          <h1 className="text-3xl text-[#064e3b] font-bold">
            Selamat Datang, {userName.split(' ')[0]}!
          </h1>
          {syncStatus === 'success' && (
            <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
              <CheckCircle size={12} className="text-green-700" />
              <span>Akun Aktif • {tier.toUpperCase()} Tier</span>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
             TOP UP SECTION — Besar, Jelas, dan Fungsional
           ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
          
          {/* Card Saldo — Glassmorphism */}
          <div className="flex flex-col h-full w-full">
            <WalletBalanceCard
              balance={userBalance}
              accountNumber={accountNumber}
              userName={userName}
              onTopUpClick={() => setShowTopUp(!showTopUp)}
              onTransferClick={() => setShowTransferModal(true)}
            />
          </div>

          {/* Card Karbon */}
          <div className="bg-[#111827] text-white p-6 rounded-[24px] shadow-lg relative overflow-hidden h-full flex flex-col justify-between border border-gray-800 min-h-[220px]">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#115e59]/20 rounded-full blur-3xl"></div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-800 text-emerald-400 rounded-xl flex items-center justify-center border border-gray-700/50">
                  <Leaf size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-300/80 font-bold leading-none">Dampak Lingkungan</p>
                  <h4 className="font-black text-sm text-white mt-1">Eco-Impact</h4>
                </div>
              </div>
              <span className="text-gray-400 text-xs font-semibold tracking-wide block mb-1">Pengurangan Karbon</span>
              <h2 className="text-2xl font-bold font-sans text-emerald-400 tracking-tight">{Number(impactScore * 0.5).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg CO2e</h2>
            </div>
            <div className="pt-3 border-t border-gray-800 mt-4">
              <Link href="/dashboard/investasi" className="text-xs text-emerald-400 font-bold hover:underline flex items-center justify-between">
                <span>Tingkatkan Impact</span>
                <span>➔</span>
              </Link>
            </div>
          </div>

          {/* Card Eco Points */}
          <div className="bg-white border border-gray-100 p-6 rounded-[24px] shadow-sm h-full flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <Heart size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-blue-500/80 font-bold leading-none">Loyalti Hijau</p>
                  <h4 className="font-black text-sm text-gray-900 mt-1">Eco-Points</h4>
                </div>
              </div>
              <span className="text-gray-500 text-xs font-semibold tracking-wide block mb-1">Poin Eco - Tier {tier.toUpperCase()}</span>
              <h2 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">{userEcoPoints} Poin</h2>
            </div>
            <div className="pt-3 border-t border-gray-100 mt-4">
              <div className="flex justify-between text-[9px] text-gray-500 font-bold mb-1">
                <span>{displayTierName === 'PLATINUM' ? 'Tier Tertinggi Dicapai' : progressText}</span>
                <span>
                  {displayTierName === 'PLATINUM' 
                    ? 'Status: Tier Maksimal Tercapai'
                    : `${userLifetimeEcoPoints.toLocaleString('id-ID')} / ${maxPoints.toLocaleString('id-ID')} XP`}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.min((userLifetimeEcoPoints / maxPoints) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Aksi Cepat */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-[#064e3b] mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {/* Top Up — Active State */}
            <button 
              onClick={() => setShowTopUp(true)} 
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-emerald-200 shadow-[0_4px_16px_-4px_rgba(16,185,129,0.15)] hover:shadow-[0_6px_20px_-4px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03]"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <Wallet size={20}/>
              </div>
              <span className="text-xs font-bold text-emerald-600 text-center">Top Up</span>
            </button>

            {/* Transfer */}
            <button 
              onClick={() => setShowTransferModal(true)} 
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:border-emerald-100 hover:shadow-[0_4px_12px_-4px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03]"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
                <ArrowRightLeft size={20}/>
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center">Transfer</span>
            </button>

            {/* Tagihan, Investasi, QRIS, Donasi */}
            {[
              { label: "Tagihan", icon: <CreditCard size={20}/>, color: "bg-orange-50 text-orange-600", href: "/dashboard/tagihan" },
              { label: "Investasi", icon: <PieChart size={20}/>, color: "bg-blue-50 text-blue-600", href: "/dashboard/investasi" },
              { label: "QRIS", icon: <QrCode size={20}/>, color: "bg-emerald-50 text-emerald-600", href: "/dashboard/qris" },
              { label: "Donasi", icon: <Heart size={20}/>, color: "bg-rose-50 text-rose-600", href: "/dashboard/donasi" },
            ].map((action, i) => (
              <Link 
                key={i} 
                href={action.href} 
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:border-emerald-100 hover:shadow-[0_4px_12px_-4px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03]"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Riwayat Transaksi Terakhir */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-2xl font-bold text-[#064e3b]">Riwayat Transaksi Terakhir</h3>
            <Link 
              href="/dashboard/riwayat" 
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {trxLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-2 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded-lg w-24" />
                  </div>
                ))}
              </div>
            ) : recentTrx.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-medium">
                Belum ada riwayat transaksi
              </div>
            ) : (
              recentTrx.map((tx, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors duration-200"
                >
                  {/* Left: Arrow icon & Middle: Title & Date */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {tx.type === 'in' || tx.type === 'admin_addition' ? (
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100/50">
                          <ArrowDownLeft size={22} />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100/50">
                          <ArrowUpRight size={22} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm md:text-base leading-tight">{tx.title?.replace(' (Midtrans)', '')}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(tx.created_at).toLocaleString("id-ID", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status & Amount */}
                  <div className="flex items-center gap-4 md:gap-6">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {tx.status || 'BERHASIL'}
                    </span>
                    <span className={`font-bold text-base md:text-lg tabular-nums ${
                      (tx.type === 'in' || tx.type === 'admin_addition') ? 'text-gray-900' : 'text-red-500'
                    }`}>
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
      <TopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSubmit={handleTopUp}
        isLoading={topUpLoading}
      />
      <StrukModal 
        isOpen={!!strukData} 
        onClose={() => setStrukData(null)} 
        data={strukData} 
      />
    </>
  );
}
