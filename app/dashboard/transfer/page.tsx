// FORCE TRIGGER DEPLOYMENT VER MARET 2026 - REVISI UAS FIX FINAL
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRightLeft, Send, Loader2, CheckCircle2, 
  AlertCircle, Wallet, FileText, ChevronLeft 
} from "lucide-react";
import Swal from "sweetalert2";
import { useUserContext } from "@/hooks/useUserData";
import { formatIDR, SwalGreenBanking } from "@/utils/format";
import StrukModal from "@/components/StrukModal";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const QUICK_AMOUNTS = [
  { value: 50000, label: "50rb" },
  { value: 100000, label: "100rb" },
  { value: 250000, label: "250rb" },
  { value: 500000, label: "500rb" },
  { value: 1000000, label: "1jt" },
  { value: 2000000, label: "2jt" },
];

export default function TransferPage() {
  const userHook = useUserContext();
  const { userBalance, refreshUserData } = userHook;

  const [rekening, setRekening] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [note, setNote] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [strukData, setStrukData] = useState<any>(null);

  // Verify Account Number dynamically
  useEffect(() => {
    if (rekening.length === 10) {
      const verifyAccount = async () => {
        setIsVerifying(true);
        setError("");
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/check-account/${rekening}`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (res.ok) {
            setRecipientName(data.name);
          } else {
            setError(data.error || "Rekening tidak ditemukan");
            setRecipientName("");
          }
        } catch (err) {
          setError("Gagal memverifikasi rekening");
          setRecipientName("");
        } finally {
          setIsVerifying(false);
        }
      };
      verifyAccount();
    } else {
      setRecipientName("");
      if (rekening.length > 0 && rekening.length < 10) {
        setError("Nomor rekening harus 10 digit");
      } else {
        setError("");
      }
    }
  }, [rekening]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (!rawValue) {
      setAmount("");
      setRawAmount(0);
      return;
    }
    const val = parseInt(rawValue, 10);
    setRawAmount(val);
    setAmount(new Intl.NumberFormat("id-ID").format(val));
  };

  const handleQuickAmountSelect = (val: number) => {
    setRawAmount(val);
    setAmount(new Intl.NumberFormat("id-ID").format(val));
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rekening.length !== 10) {
      Swal.fire({
        icon: "warning",
        title: "Input Tidak Valid",
        text: "Nomor rekening harus 10 digit angka!",
        ...SwalGreenBanking.warning,
      });
      return;
    }

    if (!recipientName) {
      Swal.fire({
        icon: "warning",
        title: "Penerima Belum Terverifikasi",
        text: "Pastikan nomor rekening tujuan valid dan nama penerima muncul.",
        ...SwalGreenBanking.warning,
      });
      return;
    }

    if (rawAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Nominal Salah",
        text: "Jumlah transfer harus lebih dari Rp 0",
        ...SwalGreenBanking.warning,
      });
      return;
    }

    if (rawAmount > userBalance) {
      Swal.fire({
        icon: "warning",
        title: "Saldo Kurang",
        text: "Saldo Eco-Wallet Anda tidak mencukupi untuk transfer ini.",
        ...SwalGreenBanking.warning,
      });
      return;
    }

    // Confirmation Modal
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Transfer",
      html: `
        <div class="text-left text-sm mt-4 space-y-2.5">
          <p><strong>Penerima:</strong> ${recipientName}</p>
          <p><strong>No. Rekening:</strong> ${rekening}</p>
          <p><strong>Nominal:</strong> Rp ${new Intl.NumberFormat("id-ID").format(rawAmount)}</p>
          ${note ? `<p><strong>Catatan:</strong> ${note}</p>` : ""}
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Ya, Kirim Sekarang",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    // PIN Verification Modal
    const { value: pin, isDismissed } = await Swal.fire({
      title: "Masukkan PIN Transaksi",
      input: "password",
      inputLabel: "Masukkan 6-Digit PIN Keamanan GreenBanking Anda",
      inputPlaceholder: "••••••",
      inputAttributes: {
        maxlength: "6",
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Verifikasi",
      cancelButtonText: "Batal",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#d33",
      inputValidator: (value) => {
        if (!value) return "PIN tidak boleh kosong!";
        if (value.length !== 6) return "PIN harus 6 digit!";
      },
    });

    if (isDismissed || !pin) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to_account: rekening,
          destination_account: rekening,
          account_number: rekening,
          amount: rawAmount,
          note: note,
          service_type: "transfer",
          service_label: "Transfer Dana",
          recipient_name: recipientName,
          pin: pin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Gagal melakukan transaksi");
      }

      Swal.fire({
        icon: "success",
        title: "Transfer Berhasil!",
        text: `Sukses kirim Rp ${new Intl.NumberFormat("id-ID").format(rawAmount)} ke ${recipientName}.`,
        confirmButtonColor: "#059669",
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

      setStrukData({
        id: data.transaction_id || `TRX-${Date.now()}`,
        time: timeStr,
        service: "Transfer Dana P2P",
        title: "Struk Transfer Dana",
        amount: rawAmount,
        to_account: rekening,
        recipient_name: recipientName,
        note: note,
      });

      // Clear Form
      setRekening("");
      setRecipientName("");
      setAmount("");
      setRawAmount(0);
      setNote("");
      refreshUserData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Transaksi Gagal",
        text: err.message || "Gagal memproses transfer.",
        ...SwalGreenBanking.error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
        {/* Back Link */}
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors uppercase tracking-widest mb-6"
        >
          <ChevronLeft size={16} />
          <span>Kembali ke Dasbor</span>
        </Link>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <ArrowRightLeft className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase">Kirim Dana P2P</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Transfer Sesama Nasabah
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kirim saldo Eco-Wallet secara instan tanpa biaya admin ke sesama pengguna EcoBank.
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6"
        >
          <form onSubmit={handleTransferSubmit} className="space-y-5">
            
            {/* Target Account Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nomor Rekening Tujuan
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={rekening}
                  onChange={(e) => setRekening(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Masukkan 10 digit nomor rekening"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                {isVerifying && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-blue-500 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 select-none">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Verifikasi...</span>
                  </div>
                )}
                {!isVerifying && recipientName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-emerald-700 font-black bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 select-none">
                    <CheckCircle2 size={12} />
                    <span>Valid</span>
                  </div>
                )}
              </div>

              {/* Account verify state feedback */}
              {!isVerifying && recipientName && (
                <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  Penerima: <span className="underline">{recipientName}</span>
                </p>
              )}
              {error && (
                <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {error}
                </p>
              )}
            </div>

            {/* Quick Amount Grid */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Pilih Nominal Cepat
              </label>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleQuickAmountSelect(item.value)}
                    className={`py-3 px-2 rounded-xl text-center font-bold text-xs border-2 transition-all duration-200 ${
                      rawAmount === item.value
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/20"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nominal Transfer
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl outline-none transition-all font-black text-xl text-gray-900 placeholder:text-gray-300 ${
                    rawAmount > userBalance
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20 text-red-600"
                      : "border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  }`}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] text-gray-400">Pastikan nominal transfer sudah benar</span>
                <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                  <Wallet size={10} />
                  Saldo Anda: {formatIDR(userBalance)}
                </span>
              </div>
              {rawAmount > userBalance && (
                <p className="text-red-500 text-xs font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Saldo Anda tidak mencukupi untuk nominal transfer ini
                </p>
              )}
            </div>

            {/* Note Field (Optional) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Catatan / Pesan (Opsional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Pembayaran makan siang"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isVerifying || rawAmount <= 0 || rawAmount > userBalance || !recipientName}
              className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-6 text-white ${
                isLoading || isVerifying || rawAmount <= 0 || rawAmount > userBalance || !recipientName
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 hover:shadow-xl hover:shadow-emerald-600/20 hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Memproses Transfer...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Kirim Dana</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Pop Up Struk Modal */}
      <StrukModal
        isOpen={!!strukData}
        onClose={() => setStrukData(null)}
        data={strukData}
      />
    </>
  );
}
