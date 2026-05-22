"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, Zap, Droplets, Loader2, ShieldCheck, 
  Receipt, CheckCircle2, ChevronRight, HelpCircle, Leaf 
} from "lucide-react";
import { useUserContext } from "@/hooks/useUserData";
import { formatIDR, SwalGreenBanking } from "@/utils/format";
import Swal from "sweetalert2";
import StrukModal from "@/components/StrukModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const PDAM_REGIONS = [
  "PDAM Kota Malang",
  "PDAM Kabupaten Sidoarjo",
  "PDAM Kota Surabaya",
  "PDAM DKI Jakarta",
];

// Deteksi operator berdasarkan prefix
function detectOperator(phone: string): string | null {
  if (phone.length < 4) return null;
  const prefix = phone.substring(0, 4);
  if (["0811", "0812", "0813", "0821", "0822"].includes(prefix)) return "Telkomsel";
  if (["0895", "0896", "0897", "0898", "0899"].includes(prefix)) return "Tri";
  if (["0817", "0818", "0819", "0877", "0878"].includes(prefix)) return "XL";
  return "Operator";
}

const mockNames = ["Krisna Aji", "Sufyan MH", "Rayhan K", "Budi Santoso", "Siti Aminah", "Ahmad Fauzi", "Rina Marlina"];

export default function TagihanPage() {
  const { userBalance, refreshUserData } = useUserContext();
  const [activeTab, setActiveTab] = useState<"pulsa" | "pln" | "pdam">("pulsa");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [strukData, setStrukData] = useState<any>(null);
  const [mangroveProgress, setMangroveProgress] = useState(0);

  // Load mangrove progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mangrove_progress");
    if (saved) {
      setMangroveProgress(parseInt(saved, 10) || 0);
    }
  }, []);

  // State Pulsa
  const [phoneNumber, setPhoneNumber] = useState("");
  const [detectedOperator, setDetectedOperator] = useState<string | null>(null);
  const [pulsaManualAmount, setPulsaManualAmount] = useState("");

  // State PLN
  const [plnServiceType, setPlnServiceType] = useState<"token" | "tagihan">("token");
  const [plnCustomerId, setPlnCustomerId] = useState("");
  const [plnManualAmount, setPlnManualAmount] = useState("");
  const [plnMockName, setPlnMockName] = useState("");
  const [isSimulatingPln, setIsSimulatingPln] = useState(false);

  // State PDAM
  const [pdamRegion, setPdamRegion] = useState("");
  const [pdamCustomerId, setPdamCustomerId] = useState("");
  const [pdamManualAmount, setPdamManualAmount] = useState("");
  const [pdamMockName, setPdamMockName] = useState("");
  const [isSimulatingPdam, setIsSimulatingPdam] = useState(false);

  // Effect Pulsa: Deteksi prefix nomor handphone
  useEffect(() => {
    if (phoneNumber.length >= 4) {
      setDetectedOperator(detectOperator(phoneNumber));
    } else {
      setDetectedOperator(null);
    }
  }, [phoneNumber]);

  // Effect PLN: Mock API
  useEffect(() => {
    if (plnCustomerId.length >= 11 && !plnMockName && !isSimulatingPln) {
      setIsSimulatingPln(true);
      setTimeout(() => {
        setPlnMockName(mockNames[Math.floor(Math.random() * mockNames.length)]);
        setIsSimulatingPln(false);
      }, 1000);
    } else if (plnCustomerId.length < 11) {
      setPlnMockName("");
    }
  }, [plnCustomerId]);

  // Effect PDAM: Mock API
  useEffect(() => {
    if (pdamCustomerId.length >= 6 && !pdamMockName && !isSimulatingPdam) {
      setIsSimulatingPdam(true);
      setTimeout(() => {
        setPdamMockName(mockNames[Math.floor(Math.random() * mockNames.length)]);
        setIsSimulatingPdam(false);
      }, 1000);
    } else if (pdamCustomerId.length < 6) {
      setPdamMockName("");
    }
  }, [pdamCustomerId]);


  // Reset states when changing tab
  const handleTabChange = (tab: "pulsa" | "pln" | "pdam") => {
    setActiveTab(tab);
  };

  // Get current active form total & description
  const getCheckoutDetails = () => {
    if (activeTab === "pulsa") {
      if (!phoneNumber || !pulsaManualAmount || !detectedOperator) return null;
      return {
        amount: Number(pulsaManualAmount) + 1000,
        bill_type: "pulsa",
        customer_id: phoneNumber,
        product_name: `${detectedOperator} Rp${Number(pulsaManualAmount)/1000}k`,
        admin_fee: 1000,
      };
    } else if (activeTab === "pln") {
      if (plnCustomerId.length < 11 || !plnMockName || !plnManualAmount) return null;
      if (plnServiceType === "token") {
        return {
          amount: Number(plnManualAmount) + 1500,
          bill_type: "pln",
          customer_id: plnCustomerId,
          product_name: `Token Listrik Rp${Number(plnManualAmount)/1000}k`,
          admin_fee: 1500,
        };
      } else {
        return {
          amount: Number(plnManualAmount) + 2500,
          bill_type: "pln",
          customer_id: plnCustomerId,
          product_name: "Tagihan Listrik PLN",
          admin_fee: 2500,
        };
      }
    } else if (activeTab === "pdam") {
      if (!pdamRegion || pdamCustomerId.length < 6 || !pdamMockName || !pdamManualAmount) return null;
      return {
        amount: Number(pdamManualAmount) + 2500,
        bill_type: "pdam",
        customer_id: pdamCustomerId,
        product_name: `Tagihan ${pdamRegion}`,
        admin_fee: 2500,
      };
    }
    return null;
  };

  const currentCheckout = getCheckoutDetails();

  const handleCheckoutTagihan = async () => {
    if (!currentCheckout) return;

    if (userBalance < currentCheckout.amount) {
      Swal.fire({
        icon: "warning",
        title: "Saldo Tidak Mencukupi",
        text: "Saldo utama Anda tidak mencukupi untuk melakukan pembayaran ini.",
        ...SwalGreenBanking.warning,
      });
      return;
    }

    setCheckoutLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/checkout/tagihan-saldo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: currentCheckout.amount,
          customer_number: currentCheckout.customer_id,
          product_name: currentCheckout.product_name,
          category: activeTab,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Transaksi Gagal",
          text: data.message || data.error || "Gagal memproses transaksi saldo.",
          ...SwalGreenBanking.error,
        });
        setCheckoutLoading(false);
        return;
      }

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Pembayaran Berhasil!",
          text: `${currentCheckout.product_name} sukses diproses menggunakan saldo utama.`,
          ...SwalGreenBanking.success,
        });

        // Perbarui state saldo utama & eco points secara real-time di UI
        refreshUserData({
          balance: data.new_balance,
          eco_points: data.eco_points,
          tier: data.tier,
        });

        // Update mangrove progress
        setMangroveProgress((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            localStorage.setItem("mangrove_progress", "0");
            setTimeout(() => {
              Swal.fire({
                icon: "success",
                title: "Selamat!",
                text: "Anda telah menyumbangkan 1 bibit mangrove!",
                ...SwalGreenBanking.success,
              });
            }, 1500);
            return 0;
          } else {
            localStorage.setItem("mangrove_progress", next.toString());
            return next;
          }
        });

        const timeStr =
          new Date().toLocaleString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) + " WIB";

        // Tampilkan struk modal
        setStrukData({
          id: data.transaction?.transaction_id || `BILL-${Date.now()}`,
          time: timeStr,
          service: `Pembayaran ${activeTab.toUpperCase()}`,
          recipient_name: "EcoBank PPOB Merchant",
          to_account: `${currentCheckout.customer_id} (${currentCheckout.product_name})`,
          amount: currentCheckout.amount,
          title: "Struk Pembayaran Tagihan",
        });

        // Reset states
        setPhoneNumber("");
        setPlnCustomerId("");
        setPdamCustomerId("");
        setPulsaManualAmount("");
        setPlnManualAmount("");
        setPdamManualAmount("");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan Jaringan",
        text: "Gagal terhubung dengan server EcoBank.",
        ...SwalGreenBanking.error,
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <Receipt className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase">PPOB EcoBank</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Tagihan & Layanan Digital
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pembayaran pulsa, listrik, dan air bersih secara praktis, terintegrasi, dan ramah lingkungan.
          </p>
        </div>

        {/* Categories Tab Layout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-1 mb-6">
          <button
            onClick={() => handleTabChange("pulsa")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm transition-all ${
              activeTab === "pulsa"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Smartphone className="w-4 h-4 md:w-5 h-5" />
            Pulsa & Paket Data
          </button>
          <button
            onClick={() => handleTabChange("pln")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm transition-all ${
              activeTab === "pln"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Zap className="w-4 h-4 md:w-5 h-5" />
            Listrik PLN
          </button>
          <button
            onClick={() => handleTabChange("pdam")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm transition-all ${
              activeTab === "pdam"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Droplets className="w-4 h-4 md:w-5 h-5" />
            Air PDAM
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
              
              {/* FORM PULSA */}
              {activeTab === "pulsa" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nomor Handphone
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        maxLength={12}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Contoh: 08123456789"
                        className="w-full pl-4 pr-24 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                      {detectedOperator && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black px-3 py-1.5 rounded-lg select-none">
                          {detectedOperator}
                        </div>
                      )}
                    </div>
                  </div>

                  {detectedOperator ? (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Nominal Pulsa / Paket Data (Rp)
                      </label>
                      <input
                        type="number"
                        min={10000}
                        value={pulsaManualAmount}
                        onChange={(e) => setPulsaManualAmount(e.target.value)}
                        placeholder="Masukkan nominal, contoh: 50000"
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                      <Smartphone className="w-10 h-10 mx-auto mb-2 text-gray-300 animate-pulse" />
                      <p className="text-xs font-medium">Masukkan nomor HP di atas (maks 12 angka) untuk menampilkan form</p>
                    </div>
                  )}
                </div>
              )}

              {/* FORM PLN */}
              {activeTab === "pln" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Jenis Layanan Listrik
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { setPlnServiceType("token"); setPlnManualAmount(""); }}
                        className={`py-3 px-4 rounded-xl font-bold text-xs transition-all border ${
                          plnServiceType === "token"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        Token Listrik
                      </button>
                      <button
                        onClick={() => { setPlnServiceType("tagihan"); setPlnManualAmount(""); }}
                        className={`py-3 px-4 rounded-xl font-bold text-xs transition-all border ${
                          plnServiceType === "tagihan"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        Tagihan Listrik
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nomor Meter / ID Pelanggan
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={plnCustomerId}
                      onChange={(e) => setPlnCustomerId(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Masukkan 11-12 digit ID Pelanggan"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>

                  {plnCustomerId.length >= 11 ? (
                    isSimulatingPln ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Customer Details Box */}
                        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-sm space-y-2">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Informasi Pelanggan</p>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nama</span>
                            <span className="font-bold text-gray-900">{plnMockName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tarif / Daya</span>
                            <span className="font-bold text-gray-900">R1 / 900 VA</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Nominal {plnServiceType === 'token' ? 'Token' : 'Tagihan'} (Rp)
                          </label>
                          <input
                            type="number"
                            min={20000}
                            value={plnManualAmount}
                            onChange={(e) => setPlnManualAmount(e.target.value)}
                            placeholder="Masukkan nominal, contoh: 100000"
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                          />
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                      <Zap className="w-10 h-10 mx-auto mb-2 text-gray-300 animate-pulse" />
                      <p className="text-xs font-medium">Masukkan nomor meteran (min. 11 angka) untuk melacak data tagihan</p>
                    </div>
                  )}
                </div>
              )}

              {/* FORM PDAM */}
              {activeTab === "pdam" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Pilih Wilayah / Kota
                      </label>
                      <select
                        value={pdamRegion}
                        onChange={(e) => setPdamRegion(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      >
                        <option value="">-- Pilih Wilayah --</option>
                        {PDAM_REGIONS.map((reg) => (
                          <option key={reg} value={reg}>
                            {reg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nomor Pelanggan PDAM
                      </label>
                      <input
                        type="text"
                        value={pdamCustomerId}
                        onChange={(e) => setPdamCustomerId(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Contoh: 109823412"
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                  </div>

                  {pdamRegion && pdamCustomerId.length >= 6 ? (
                    isSimulatingPdam ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Customer Details Box */}
                        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-sm space-y-2">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Detail Pelanggan PDAM</p>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nama Pelanggan</span>
                            <span className="font-bold text-gray-900">{pdamMockName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Wilayah</span>
                            <span className="font-bold text-gray-900">{pdamRegion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Periode Tagihan</span>
                            <span className="font-bold text-gray-900">Bulan Ini</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Nominal Pembayaran (Rp)
                          </label>
                          <input
                            type="number"
                            min={10000}
                            value={pdamManualAmount}
                            onChange={(e) => setPdamManualAmount(e.target.value)}
                            placeholder="Masukkan nominal, contoh: 45000"
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                          />
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                      <Droplets className="w-10 h-10 mx-auto mb-2 text-gray-300 animate-pulse" />
                      <p className="text-xs font-medium">Pilih wilayah kota dan ketik nomor pelanggan air PDAM Anda</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
              <h3 className="text-md font-bold text-gray-900">Ringkasan Pembayaran</h3>

              {currentCheckout ? (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Layanan</span>
                    <span className="font-semibold text-gray-800 uppercase">{currentCheckout.bill_type}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Produk</span>
                    <span className="font-semibold text-gray-800 text-right max-w-[150px]">{currentCheckout.product_name}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>No. Pelanggan</span>
                    <span className="font-semibold text-gray-800 font-mono text-xs">{currentCheckout.customer_id}</span>
                  </div>
                  {currentCheckout.admin_fee > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Biaya Admin</span>
                      <span className="font-semibold text-gray-800">{formatIDR(currentCheckout.admin_fee)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                    <span className="font-bold text-gray-800">Total Harga</span>
                    <span className="text-xl font-black text-emerald-600">
                      {formatIDR(currentCheckout.amount)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckoutTagihan}
                    disabled={checkoutLoading}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Lanjutkan Pembayaran"
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center text-gray-400 space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-xs font-semibold leading-relaxed">
                    Lengkapi detail formulir tagihan Anda untuk memproses pembayaran
                  </p>
                </div>
              )}
            </div>

            {/* Tanam Mangrove Widget */}
            <div className="bg-emerald-950 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="relative mb-6 h-32 flex items-end justify-center">
                <div className="absolute bottom-0 w-2 h-12 bg-emerald-900 rounded-t-sm"></div>
                <div className="w-24 h-24 bg-[#a3e635] rounded-full blur-md opacity-80 absolute bottom-6 z-10"></div>
                <div className="w-16 h-16 bg-emerald-400 rounded-full blur-sm absolute bottom-12 z-20"></div>
                <div className="w-12 h-12 bg-[#a3e635] rounded-full flex items-center justify-center absolute bottom-14 z-30 shadow-[0_0_15px_rgba(163,230,53,0.8)] animate-pulse">
                  <Leaf size={24} className="text-emerald-950 animate-bounce" />
                </div>
              </div>
              
              <h2 className="text-xl font-serif font-bold mb-2 text-center relative z-10">Tanam Mangrove</h2>
              <p className="text-emerald-100/90 text-sm mb-6 leading-relaxed text-center relative z-10">
                Setiap 5x pembayaran tagihan, Anda menyumbang 1 bibit mangrove ke alam.
              </p>

              <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold">Progress</span>
                  <span className="text-sm font-bold">{mangroveProgress} / 5</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 mb-3">
                  <div className="bg-[#a3e635] h-2 rounded-full transition-all duration-500" style={{width: `${(mangroveProgress / 5) * 100}%`}}></div>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-semibold text-center">Bayar tagihan untuk mulai menanam!</p>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Garansi Transaksi Aman</h4>
              </div>
              <p className="text-xs text-emerald-700/80 leading-relaxed">
                Setiap pembayaran tagihan melalui EcoBank diamankan dengan enkripsi modern. Anda juga berhak mendapatkan poin EcoPoints untuk setiap kontribusi pelestarian lingkungan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Struk Modal Pop-up on Success */}
      <StrukModal
        isOpen={!!strukData}
        onClose={() => setStrukData(null)}
        data={strukData}
      />
    </>
  );
}
