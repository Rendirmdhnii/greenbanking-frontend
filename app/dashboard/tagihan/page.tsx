// FORCE TRIGGER DEPLOYMENT VER MARET 2026 - REVISI UAS FIX FINAL
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
  if (["0811", "0812", "0813", "0821", "0822", "0851", "0852", "0853"].includes(prefix)) return "Telkomsel";
  if (["0814", "0815", "0816", "0855", "0856", "0857", "0858"].includes(prefix)) return "Indosat";
  if (["0817", "0818", "0819", "0859", "0877", "0878", "0831", "0832", "0833", "0838"].includes(prefix)) return "XL / Axis";
  if (["0895", "0896", "0897", "0898", "0899"].includes(prefix)) return "Tri";
  if (["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"].includes(prefix)) return "Smartfren";
  return null;
}

export default function TagihanPage() {
  const { userBalance, userEcoPoints, refreshUserData, impactScore: contextImpactScore, userName, userEmail, mangroveProgress: dbMangroveProgress } = useUserContext();
  const [activeTab, setActiveTab] = useState<"pulsa" | "pln" | "pdam">("pulsa");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [strukData, setStrukData] = useState<any>(null);
  const [mangroveProgress, setMangroveProgress] = useState(0);
  const [useEcoPointsForDiscount, setUseEcoPointsForDiscount] = useState(false);
  const [impactScore, setImpactScore] = useState(0);

  // Sync impactScore with user context when loaded
  useEffect(() => {
    if (contextImpactScore !== undefined) {
      setImpactScore(contextImpactScore);
    }
  }, [contextImpactScore]);

  // Sync mangroveProgress with database/context when loaded or when user changes
  useEffect(() => {
    if (dbMangroveProgress !== undefined) {
      setMangroveProgress(dbMangroveProgress);
    } else {
      setMangroveProgress(0);
    }
  }, [dbMangroveProgress, userEmail]);

  // State Pulsa
  const [phoneNumber, setPhoneNumber] = useState("");
  const [detectedOperator, setDetectedOperator] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const [pulsaManualAmount, setPulsaManualAmount] = useState("");
  const pulsaOptions = [10000, 25000, 50000, 100000];

  // State PLN
  const [plnServiceType, setPlnServiceType] = useState<"token" | "tagihan">("token");
  const [plnCustomerId, setPlnCustomerId] = useState("");
  const [isSimulatingPln, setIsSimulatingPln] = useState(false);
  const [plnInquiry, setPlnInquiry] = useState<any>(null);

  // State PDAM
  const [pdamRegion, setPdamRegion] = useState("");
  const [pdamCustomerId, setPdamCustomerId] = useState("");
  const [isSimulatingPdam, setIsSimulatingPdam] = useState(false);
  const [pdamInquiry, setPdamInquiry] = useState<any>(null);
  const [pdamError, setPdamError] = useState("");

  // Effect Pulsa: Deteksi prefix & validasi nomor handphone
  useEffect(() => {
    if (phoneNumber.length === 0) {
      setDetectedOperator(null);
      setPhoneError("");
      return;
    }

    if (phoneNumber.length >= 4) {
      const op = detectOperator(phoneNumber);
      setDetectedOperator(op);

      if (!op) {
        setPhoneError("Provider tidak dikenali. Periksa kembali nomor Anda.");
      } else if (phoneNumber.length > 4 && (phoneNumber.length < 11 || phoneNumber.length > 13)) {
        setPhoneError("Nomor HP harus terdiri dari 11 - 13 digit.");
      } else {
        setPhoneError("");
      }
    } else {
      setDetectedOperator(null);
      setPhoneError("");
    }
  }, [phoneNumber]);

  // Effect PLN: Client-side Mock Simulation with 1.5s Fake Loading
  useEffect(() => {
    if (plnCustomerId.length >= 11) {
      // Check if already paid
      const paidIds = JSON.parse(localStorage.getItem("paidPPOBIds") || "[]");
      if (paidIds.includes(plnCustomerId)) {
        setPlnInquiry({
          customer_name: userName || "EcoBank User",
          customer_number: plnCustomerId,
          is_paid: true,
          bill_month: "Juni 2026",
          amount: 0,
          admin_fee: 0,
          total_amount: 0,
          tariff_power: plnServiceType === "token" ? "R1/450VA" : "R1/1300VA Pasca",
          category: "pln",
        });
        setIsSimulatingPln(false);
        return;
      }

      setIsSimulatingPln(true);
      setPlnInquiry(null);
      const timer = setTimeout(() => {
        const randomAmt = Math.floor(Math.random() * (300 - 50 + 1) + 50) * 1000;
        const tariffPower = plnServiceType === "token"
          ? (Math.random() > 0.5 ? "R1/450VA" : "R1M/900VA")
          : "R1/1300VA Pasca";
        
        setPlnInquiry({
          customer_name: userName || "EcoBank User",
          customer_number: plnCustomerId,
          bill_month: "Juni 2026",
          amount: randomAmt,
          admin_fee: 2500,
          total_amount: randomAmt + 2500,
          tariff_power: tariffPower,
          category: "pln",
        });
        setIsSimulatingPln(false);
      }, 1500);
      return () => {
        clearTimeout(timer);
        setIsSimulatingPln(false);
      };
    } else {
      setPlnInquiry(null);
      setIsSimulatingPln(false);
    }
  }, [plnCustomerId, plnServiceType, userName]);

  // Effect PDAM: Validasi Input Nomor Pelanggan PDAM
  useEffect(() => {
    if (pdamCustomerId.length === 0) {
      setPdamError("");
    } else if (pdamCustomerId.length < 6) {
      setPdamError("Nomor pelanggan tidak valid (minimal 6 digit)");
    } else {
      setPdamError("");
    }
  }, [pdamCustomerId]);

  // Effect PDAM: Client-side Mock Simulation with 1.5s Fake Loading
  useEffect(() => {
    if (pdamRegion && pdamCustomerId.length >= 6 && !pdamError) {
      // Check if already paid
      const paidIds = JSON.parse(localStorage.getItem("paidPPOBIds") || "[]");
      if (paidIds.includes(pdamCustomerId)) {
        setPdamInquiry({
          customer_name: userName || "EcoBank User",
          customer_number: pdamCustomerId,
          is_paid: true,
          bill_month: "Juni 2026",
          amount: 0,
          admin_fee: 0,
          total_amount: 0,
          region: pdamRegion,
          category: "pdam",
        });
        setIsSimulatingPdam(false);
        return;
      }

      setIsSimulatingPdam(true);
      setPdamInquiry(null);
      const timer = setTimeout(() => {
        const randomAmt = Math.floor(Math.random() * (250 - 40 + 1) + 40) * 1000;
        
        setPdamInquiry({
          customer_name: userName || "EcoBank User",
          customer_number: pdamCustomerId,
          bill_month: "Juni 2026",
          amount: randomAmt,
          admin_fee: 2500,
          total_amount: randomAmt + 2500,
          region: pdamRegion,
          category: "pdam",
        });
        setIsSimulatingPdam(false);
      }, 1500);
      return () => {
        clearTimeout(timer);
        setIsSimulatingPdam(false);
      };
    } else {
      setPdamInquiry(null);
      setIsSimulatingPdam(false);
    }
  }, [pdamCustomerId, pdamRegion, userName, pdamError]);


  // Reset states when changing tab
  const handleTabChange = (tab: "pulsa" | "pln" | "pdam") => {
    setActiveTab(tab);
  };

  // Get current active form total & description
  const getCheckoutDetails = () => {
    if (activeTab === "pulsa") {
      if (!phoneNumber || phoneNumber.length < 11 || phoneNumber.length > 13 || !pulsaManualAmount || !detectedOperator || phoneError) return null;
      return {
        amount: Number(pulsaManualAmount) + 1500,
        bill_type: "pulsa",
        customer_id: phoneNumber,
        product_name: `${detectedOperator} Rp${Number(pulsaManualAmount)/1000}k`,
        admin_fee: 1500,
      };
    } else if (activeTab === "pln") {
      if (!plnInquiry) return null;
      return {
        amount: plnInquiry.total_amount,
        bill_type: "pln",
        customer_id: plnCustomerId,
        product_name: plnServiceType === "token" ? `Token PLN ${formatIDR(plnInquiry.amount)} (${plnInquiry.customer_name})` : `Tagihan PLN Pasca (${plnInquiry.customer_name})`,
        admin_fee: plnInquiry.admin_fee,
        is_paid: plnInquiry.is_paid || false,
      };
    } else if (activeTab === "pdam") {
      if (!pdamInquiry) return null;
      return {
        amount: pdamInquiry.total_amount,
        bill_type: "pdam",
        customer_id: pdamCustomerId,
        product_name: `PDAM ${pdamRegion} (${pdamInquiry.customer_name})`,
        admin_fee: pdamInquiry.admin_fee,
        is_paid: pdamInquiry.is_paid || false,
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
        title: "Transaksi Gagal!",
        text: "Saldo Eco-Wallet Anda tidak mencukupi!",
        ...SwalGreenBanking.warning,
      });
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

    if (isDismissed || !pin) return;

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
          use_points: useEcoPointsForDiscount,
          pin: pin,
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
          impact_score: data.impact_score,
          total_mangrove: data.total_mangrove,
          mangrove_progress: data.mangrove_progress,
        });

        // Sync local mangrove progress directly from the backend response
        setMangroveProgress(data.mangrove_progress);

        // Tampilkan notifikasi jika berhasil mengumpulkan 5 kelipatan (progres kembali ke 0)
        if (data.mangrove_progress === 0) {
          setTimeout(() => {
            Swal.fire({
              icon: "success",
              title: "Selamat!",
              text: "Anda telah menyumbangkan 1 bibit mangrove!",
              ...SwalGreenBanking.success,
            });
          }, 1500);
        }

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
          discount: useEcoPointsForDiscount ? Math.min(userEcoPoints, currentCheckout.amount * 0.10) : 0,
          title: "Struk Pembayaran Tagihan",
        });

        // Save to paidPPOBIds in localStorage for double payment prevention
        if (activeTab === "pln" && plnCustomerId) {
          const paidIds = JSON.parse(localStorage.getItem("paidPPOBIds") || "[]");
          if (!paidIds.includes(plnCustomerId)) {
            paidIds.push(plnCustomerId);
            localStorage.setItem("paidPPOBIds", JSON.stringify(paidIds));
          }
        } else if (activeTab === "pdam" && pdamCustomerId) {
          const paidIds = JSON.parse(localStorage.getItem("paidPPOBIds") || "[]");
          if (!paidIds.includes(pdamCustomerId)) {
            paidIds.push(pdamCustomerId);
            localStorage.setItem("paidPPOBIds", JSON.stringify(paidIds));
          }
        }

        // Reset states
        setPhoneNumber("");
        setPlnCustomerId("");
        setPdamCustomerId("");
        setPulsaManualAmount("");
        setPlnInquiry(null);
        setPdamInquiry(null);
        setUseEcoPointsForDiscount(false);
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
      {/* ═══════════════════════════════════════════════════════════════
          OUTER WRAPPER — locks to viewport height minus topbar (5rem/80px)
          Uses overflow-y-auto to internally scroll if content overflows
          ═══════════════════════════════════════════════════════════════ */}
      <div className="h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="p-5 md:p-7 w-full">

          {/* ── Page Header ── */}
          <div className="mb-5">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Tagihan &amp; Layanan Digital
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Pembayaran pulsa, listrik, dan air bersih secara praktis, terintegrasi, dan ramah lingkungan.
            </p>
          </div>

          {/* ── Category Tabs ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1 mb-5">
            <button
              onClick={() => handleTabChange("pulsa")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                activeTab === "pulsa"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Pulsa &amp; Paket Data
            </button>
            <button
              onClick={() => handleTabChange("pln")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                activeTab === "pln"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent"
              }`}
            >
              <Zap className="w-4 h-4" />
              Listrik PLN
            </button>
            <button
              onClick={() => handleTabChange("pdam")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                activeTab === "pdam"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent"
              }`}
            >
              <Droplets className="w-4 h-4" />
              Air PDAM
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              2-COLUMN DESKTOP GRID
              Left  62% → Form + Mangrove horizontal card
              Right 38% → Payment Summary (tall) + Security footer
              ═══════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-[62%_38%] gap-5 items-start">

            {/* ────────────────────────────────────
                KOLOM KIRI: Form Area + Mangrove
                ──────────────────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Form Card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

                {/* FORM PULSA */}
                {activeTab === "pulsa" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Handphone</label>
                      <div className="relative">
                        <input
                          type="tel"
                          maxLength={13}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="Contoh: 08123456789"
                          className={`w-full pl-4 pr-24 py-3.5 border rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                            phoneError
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          }`}
                        />
                        {detectedOperator && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black px-3 py-1.5 rounded-lg select-none">
                            {detectedOperator}
                          </div>
                        )}
                      </div>
                      {phoneError && (
                        <p className="text-red-500 text-xs font-semibold mt-1.5 animate-in fade-in slide-in-from-top-1">
                          {phoneError}
                        </p>
                      )}
                    </div>

                    {detectedOperator && !phoneError && phoneNumber.length >= 11 ? (
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Pilih Nominal (Rp)</label>
                        <div className="grid grid-cols-4 gap-2">
                          {pulsaOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setPulsaManualAmount(opt.toString())}
                              className={`py-2.5 px-2 rounded-xl font-bold text-xs border transition-all ${
                                pulsaManualAmount === opt.toString()
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50"
                              }`}
                            >
                              {formatIDR(opt)}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Atau Masukkan Nominal Manual</label>
                          <input
                            type="number"
                            min={5000}
                            value={pulsaManualAmount}
                            onChange={(e) => setPulsaManualAmount(e.target.value)}
                            placeholder="Ketik nominal bebas, cth: 75000"
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                        <Smartphone className="w-9 h-9 mx-auto mb-2 text-gray-300 animate-pulse" />
                        <p className="text-xs font-medium">Masukkan nomor HP valid di atas (11 - 13 digit) untuk menampilkan pilihan nominal</p>
                      </div>
                    )}
                  </div>
                )}

                {/* FORM PLN */}
                {activeTab === "pln" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Layanan Listrik</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => { setPlnServiceType("token"); setPlnInquiry(null); setPlnCustomerId(""); }}
                          className={`py-3 px-4 rounded-xl font-bold text-xs transition-all border ${
                            plnServiceType === "token"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          Token Listrik
                        </button>
                        <button
                          onClick={() => { setPlnServiceType("tagihan"); setPlnInquiry(null); setPlnCustomerId(""); }}
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Meter / ID Pelanggan</label>
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
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                          <Loader2 className="animate-spin text-emerald-500" size={24} />
                          <span className="text-xs text-gray-500 font-medium">Mengecek ID Pelanggan...</span>
                        </div>
                      ) : plnInquiry ? (
                        plnInquiry.is_paid ? (
                          <div className="animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm font-bold flex items-center gap-2">
                              <span>Tagihan untuk nomor ini sudah lunas dibayar.</span>
                            </div>
                          </div>
                        ) : (
                          <div className="animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm space-y-3">
                              <div className="flex items-center gap-2 text-emerald-700 font-bold border-b border-emerald-100 pb-2 mb-2">
                                <CheckCircle2 size={16} />
                                <span>Data Pelanggan Ditemukan</span>
                              </div>
                              <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-bold text-gray-900">{plnInquiry.customer_name}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Tarif / Daya</span><span className="font-bold text-gray-900">{plnInquiry.tariff_power}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Bulan Tagihan</span><span className="font-bold text-gray-900">{plnInquiry.bill_month}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Tagihan Riil</span><span className="font-bold text-gray-900">{formatIDR(plnInquiry.amount)}</span></div>
                            </div>
                          </div>
                        )
                      ) : null
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                        <Zap className="w-9 h-9 mx-auto mb-2 text-gray-300 animate-pulse" />
                        <p className="text-xs font-medium">Masukkan nomor meteran (min. 11 angka) untuk auto-inquiry data tagihan</p>
                      </div>
                    )}
                  </div>
                )}

                {/* FORM PDAM */}
                {activeTab === "pdam" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Wilayah / Kota</label>
                        <select
                          value={pdamRegion}
                          onChange={(e) => { setPdamRegion(e.target.value); setPdamInquiry(null); }}
                          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                        >
                          <option value="">-- Pilih Wilayah --</option>
                          {PDAM_REGIONS.map((reg) => (
                            <option key={reg} value={reg}>{reg}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Pelanggan PDAM</label>
                        <input
                          type="text"
                          maxLength={14}
                          value={pdamCustomerId}
                          onChange={(e) => setPdamCustomerId(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="Contoh: 109823412"
                          className={`w-full px-4 py-3.5 border rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                            pdamError
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          }`}
                        />
                        {pdamError && (
                          <p className="text-red-500 text-xs font-semibold mt-1.5 animate-in fade-in slide-in-from-top-1">
                            {pdamError}
                          </p>
                        )}
                      </div>
                    </div>
                    {pdamRegion && pdamCustomerId.length >= 6 ? (
                      isSimulatingPdam ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                          <Loader2 className="animate-spin text-emerald-500" size={24} />
                          <span className="text-xs text-gray-500 font-medium">Mengecek Tagihan PDAM...</span>
                        </div>
                      ) : pdamInquiry ? (
                        pdamInquiry.is_paid ? (
                          <div className="animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm font-bold flex items-center gap-2">
                              <span>Tagihan untuk nomor ini sudah lunas dibayar.</span>
                            </div>
                          </div>
                        ) : (
                          <div className="animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm space-y-3">
                              <div className="flex items-center gap-2 text-emerald-700 font-bold border-b border-emerald-100 pb-2 mb-2">
                                <CheckCircle2 size={16} />
                                <span>Data Pelanggan Ditemukan</span>
                              </div>
                              <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-bold text-gray-900">{pdamInquiry.customer_name}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Wilayah</span><span className="font-bold text-gray-900">{pdamRegion}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Bulan Tagihan</span><span className="font-bold text-gray-900">{pdamInquiry.bill_month}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Tagihan Riil</span><span className="font-bold text-gray-900">{formatIDR(pdamInquiry.amount)}</span></div>
                            </div>
                          </div>
                        )
                      ) : null
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                        <Droplets className="w-9 h-9 mx-auto mb-2 text-gray-300 animate-pulse" />
                        <p className="text-xs font-medium">Pilih wilayah kota dan ketik nomor pelanggan air PDAM Anda (min. 6 angka)</p>
                      </div>
                    )}
                  </div>
                )}

              </div>{/* /Form Card */}

              {/* ── Tanam Mangrove — Horizontal Compact Card ── */}
              <div className="bg-emerald-950 text-white rounded-2xl p-4 shadow-lg relative overflow-hidden flex items-center gap-4">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

                {/* Animated tree icon */}
                <div className="relative flex-shrink-0 w-14 h-14 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#a3e635]/20 rounded-full blur-md absolute" />
                  <div className="w-9 h-9 bg-[#a3e635] rounded-full flex items-center justify-center relative z-10 shadow-[0_0_10px_rgba(163,230,53,0.6)] animate-pulse">
                    <Leaf size={18} className="text-emerald-950" />
                  </div>
                </div>

                {/* Text + progress */}
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-white">Tanam Mangrove</h3>
                    <span className="text-xs font-black text-[#a3e635] ml-2">Skor: {impactScore.toFixed(1)}</span>
                  </div>
                  <p className="text-emerald-100/80 text-[11px] leading-snug mb-2">
                    Setiap 5× pembayaran tagihan = 1 bibit mangrove untuk alam.
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-[#a3e635] h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(mangroveProgress / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white">{mangroveProgress}/5</span>
                  </div>
                </div>
              </div>

            </div>{/* /Kolom Kiri */}

            {/* ────────────────────────────────────────────────
                KOLOM KANAN: Payment Summary + Security footer
                ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Payment Summary Card — tall & flexible */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 min-h-[340px]">
                <h3 className="text-base font-bold text-gray-900">Ringkasan Pembayaran</h3>

                <div className="flex flex-col gap-4 text-sm flex-1">
                  {currentCheckout ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-500">
                        <span>Layanan</span>
                        <span className="font-semibold text-gray-800 uppercase">{currentCheckout.bill_type}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Produk</span>
                        <span className="font-semibold text-gray-800 text-right max-w-[160px] leading-tight">{currentCheckout.product_name}</span>
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
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-gray-400 gap-3">
                      <HelpCircle className="w-9 h-9 text-gray-300 animate-pulse" />
                      <p className="text-xs font-semibold leading-relaxed max-w-[190px]">
                        Lengkapi detail formulir tagihan Anda untuk memproses pembayaran
                      </p>
                      <div className="w-full mt-3 space-y-2.5 px-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Layanan</span>
                          <span className="font-semibold text-gray-600 uppercase">{activeTab}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Produk</span>
                          <span className="w-24 h-3 bg-gray-100 rounded animate-pulse inline-block" />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>No. Pelanggan</span>
                          <span className="font-mono text-xs text-gray-600">
                            {activeTab === "pulsa" ? phoneNumber || "-" : activeTab === "pln" ? plnCustomerId || "-" : pdamCustomerId || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Biaya Admin</span>
                          <span className="font-semibold text-gray-600">
                            {activeTab === "pulsa" ? formatIDR(1500) : formatIDR(2500)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentCheckout && userEcoPoints > 0 && (
                    <label className="flex items-center gap-3 p-3 border border-emerald-100 bg-emerald-50/50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={useEcoPointsForDiscount}
                        onChange={(e) => setUseEcoPointsForDiscount(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Gunakan Eco Poin</p>
                        <p className="text-xs text-emerald-700">{userEcoPoints} Poin (Maks. {formatIDR(Math.min(userEcoPoints, currentCheckout.amount * 0.10))})</p>
                      </div>
                    </label>
                  )}

                  {currentCheckout && useEcoPointsForDiscount && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Potongan Eco-Points:</span>
                      <span>- {formatIDR(Math.min(userEcoPoints, currentCheckout.amount * 0.10))}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-end mt-auto">
                    <span className="font-bold text-gray-800">Total Harga</span>
                    <span className="text-xl font-black text-emerald-600">
                      {currentCheckout ? (
                        useEcoPointsForDiscount
                          ? formatIDR(Math.max(0, currentCheckout.amount - Math.min(userEcoPoints, currentCheckout.amount * 0.10)))
                          : formatIDR(currentCheckout.amount)
                      ) : (
                        formatIDR(0)
                      )}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckoutTagihan}
                    disabled={checkoutLoading || isSimulatingPln || isSimulatingPdam || !currentCheckout || currentCheckout.is_paid}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</>
                    ) : (
                      "Bayar Sekarang"
                    )}
                  </button>
                </div>
              </div>

              {/* ── GARANSI TRANSAKSI AMAN — compact footer card ── */}
              <div className="bg-emerald-50/60 rounded-2xl border border-emerald-100/70 p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
                    Garansi Transaksi Aman
                  </h4>
                </div>
                <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                  Setiap pembayaran diamankan dengan enkripsi modern. Anda berhak mendapat{" "}
                  <span className="font-bold text-emerald-700">EcoPoints</span> untuk setiap
                  kontribusi pelestarian lingkungan.
                </p>
              </div>

            </div>{/* /Kolom Kanan */}

          </div>{/* /2-Column Grid */}
        </div>
      </div>{/* /Outer Wrapper */}

      {/* Struk Modal Pop-up on Success */}
      <StrukModal
        isOpen={!!strukData}
        onClose={() => setStrukData(null)}
        data={strukData}
      />
    </>
  );
}
