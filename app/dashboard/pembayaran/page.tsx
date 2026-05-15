"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Zap, Droplet, Wifi, Smartphone, Leaf, Loader2, InboxIcon
} from "lucide-react";
import { useUserContext } from "@/hooks/useUserData";
import TransferModal from "@/components/TransferModal";
import StrukModal from "@/components/StrukModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function PembayaranPage() {
  const userHook = useUserContext();
  const { refreshUserData } = userHook;
  const [showTransfer, setShowTransfer] = useState(false);
  const [strukData, setStrukData] = useState<any>(null);
  const [activeBill, setActiveBill] = useState("");
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [billsLoading, setBillsLoading] = useState(true);

  // ═══════════════════════════════════════════════
  //  DYNAMIC: Fetch tagihan dari API (per user_id)
  //  Jika kosong → tampilkan empty state
  // ═══════════════════════════════════════════════
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setBillsLoading(false); return; }
        const res = await fetch(`${API_URL}/bills`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setPendingBills(data.bills || []);
        }
      } catch (e) {
        // API belum ada → empty state (bukan data statis!)
        console.log("Bills API not available yet");
      } finally {
        setBillsLoading(false);
      }
    };
    fetchBills();
  }, [strukData]); // Re-fetch setelah bayar tagihan

  const billCategories = [
    { label: "PLN / Listrik", icon: <Zap size={24} />, color: "bg-yellow-50 text-yellow-600" },
    { label: "PDAM / Air", icon: <Droplet size={24} />, color: "bg-blue-50 text-blue-600" },
    { label: "Internet", icon: <Wifi size={24} />, color: "bg-purple-50 text-purple-600" },
    { label: "Ponsel", icon: <Smartphone size={24} />, color: "bg-emerald-50 text-emerald-600" },
  ];

  const getIconForBill = (title: string) => {
    if (title.toLowerCase().includes("pln") || title.toLowerCase().includes("listrik")) return <Zap size={20} />;
    if (title.toLowerCase().includes("pdam") || title.toLowerCase().includes("air")) return <Droplet size={20} />;
    if (title.toLowerCase().includes("internet") || title.toLowerCase().includes("indihome")) return <Wifi size={20} />;
    return <Smartphone size={20} />;
  };

  const getIconBg = (title: string) => {
    if (title.toLowerCase().includes("pln") || title.toLowerCase().includes("listrik")) return "bg-yellow-100 text-yellow-700";
    if (title.toLowerCase().includes("pdam") || title.toLowerCase().includes("air")) return "bg-blue-100 text-blue-700";
    if (title.toLowerCase().includes("internet") || title.toLowerCase().includes("indihome")) return "bg-purple-100 text-purple-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const handleBillClick = (billName: string) => {
    setActiveBill(billName);
    setShowTransfer(true);
  };

  return (
    <>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8"
        >
          {/* Left Column - Utilities */}
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold text-[#064e3b] mb-6">Pembayaran & Tagihan</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {billCategories.map((bill, idx) => (
                <button key={idx} onClick={() => handleBillClick(bill.label)} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all text-center group cursor-pointer">
                  <div className={`w-14 h-14 ${bill.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {bill.icon}
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{bill.label}</span>
                </button>
              ))}
            </div>

            {/* ═══ TAGIHAN TERTUNDA — 100% DINAMIS ═══ */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Tagihan Tertunda</h2>
              
              {billsLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Memuat tagihan...</span>
                </div>
              ) : pendingBills.length === 0 ? (
                /* ─── EMPTY STATE: User baru / tidak ada tagihan ─── */
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Leaf size={28} className="text-emerald-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">Tidak ada tagihan tertunda</p>
                  <p className="text-xs text-gray-400">Semua tagihan Anda sudah lunas. Tetap hijau! 🌿</p>
                </div>
              ) : (
                /* ─── DYNAMIC: Bills dari API (per user_id) ─── */
                <div className="space-y-4">
                  {pendingBills.map((bill: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${getIconBg(bill.title)} rounded-xl flex items-center justify-center`}>{getIconForBill(bill.title)}</div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{bill.title}</p>
                          <p className="text-xs text-gray-500">Batas Waktu: {bill.deadline}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          bill.status === 'Belum Bayar' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                        }`}>{bill.status}</span>
                        <button onClick={() => handleBillClick(bill.title)} className="text-sm font-bold text-gray-900 group-hover:text-[#115e59] transition-colors">
                          Rp {Number(bill.amount).toLocaleString('id-ID')} <span className="text-[#115e59] font-normal ml-1">Bayar ➔</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tree Progress */}
          <div className="w-full lg:w-80">
            <div className="bg-[#064e3b] text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="relative mb-6 h-32 flex items-end justify-center">
                <div className="absolute bottom-0 w-2 h-12 bg-emerald-900 rounded-t-sm"></div>
                <div className="w-24 h-24 bg-[#a3e635] rounded-full blur-md opacity-80 absolute bottom-6 z-10"></div>
                <div className="w-16 h-16 bg-emerald-400 rounded-full blur-sm absolute bottom-12 z-20"></div>
                <Leaf size={32} className="absolute bottom-16 z-30 text-[#064e3b] animate-bounce" />
              </div>
              
              <h2 className="text-xl font-serif font-bold mb-2 text-center relative z-10">Tanam Mangrove</h2>
              <p className="text-emerald-100 text-sm mb-6 leading-relaxed text-center relative z-10">
                Setiap 5x pembayaran tagihan, Anda menyumbang 1 bibit mangrove ke alam.
              </p>

              <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold">Progress</span>
                  <span className="text-sm font-bold">0 / 5</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 mb-3">
                  <div className="bg-[#a3e635] h-2 rounded-full transition-all" style={{width: '0%'}}></div>
                </div>
                <p className="text-[11px] text-emerald-100 font-semibold text-center">Bayar tagihan untuk mulai menanam!</p>
              </div>
            </div>
          </div>

        </motion.div>

      <TransferModal 
        isOpen={showTransfer} 
        onClose={() => setShowTransfer(false)} 
        onSuccess={(data) => {
          setStrukData(data);
          refreshUserData();
        }}
        serviceType="tagihan"
        serviceLabel="Pembayaran Tagihan"
        strukTitle="Struk Pembayaran Tagihan"
        recipientLabel={activeBill}
      />
      <StrukModal 
        isOpen={!!strukData} 
        onClose={() => setStrukData(null)} 
        data={strukData} 
      />
    </>
  );
}
