// FORCE TRIGGER DEPLOYMENT VER MARET 2026 - REVISI UAS FIX FINAL
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRightLeft, Loader2, Heart, CreditCard, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import { useUserContext } from "@/hooks/useUserData";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  /** 'transfer' | 'tagihan' | 'donasi' — defaults to 'transfer' */
  serviceType?: string;
  /** Custom title, e.g. "Donasi Lingkungan" */
  serviceLabel?: string;
  /** Custom title for the struk, e.g. "Struk Donasi" */
  strukTitle?: string;
  /** Pre-filled recipient name */
  recipientLabel?: string;
}

export default function TransferModal({ 
  isOpen, onClose, onSuccess, 
  serviceType = 'transfer', 
  serviceLabel = 'Transfer Dana',
  strukTitle = 'Struk Transfer Dana',
  recipientLabel,
}: TransferModalProps) {
  const [rekening, setRekening] = useState("");
  const [recipientName, setRecipientName] = useState(recipientLabel || "");
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  
  const { userBalance } = useUserContext();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (!rawValue) {
      setAmount("");
      setRawAmount(0);
      return;
    }
    setRawAmount(parseInt(rawValue, 10));
    setAmount(new Intl.NumberFormat('id-ID').format(parseInt(rawValue, 10)));
  };

  useEffect(() => {
    if (serviceType === 'transfer' && rekening.length === 10) {
      const verifyAccount = async () => {
        setIsVerifying(true);
        setError("");
        try {
          const token = localStorage.getItem("token");
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
          const res = await fetch(`${API_URL}/check-account/${rekening}`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
            }
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
    } else if (serviceType === 'transfer' && rekening.length !== 10) {
      if (!recipientLabel) setRecipientName("");
    }
  }, [rekening, serviceType, recipientLabel]);

  const iconMap: Record<string, React.ReactNode> = {
    transfer: <ArrowRightLeft size={20} />,
    tagihan: <CreditCard size={20} />,
    donasi: <Heart size={20} />,
  };

  const colorMap: Record<string, string> = {
    transfer: 'bg-purple-50 text-purple-600',
    tagihan: 'bg-orange-50 text-orange-600',
    donasi: 'bg-rose-50 text-rose-600',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) {
      setError("Jumlah harus lebih dari Rp 0");
      return;
    }
    if (serviceType !== 'donasi' && !rekening) {
      setError("Nomor rekening harus diisi");
      return;
    }
    if (serviceType === 'transfer' && !recipientName && !error) {
       setError("Tunggu verifikasi rekening selesai");
       return;
    }
    if (rawAmount > userBalance) {
      // Tidak melanjutkan submit jika saldo kurang (bisa dicover oleh warning text)
      return;
    }

    // Confirmation Modal with SweetAlert2
    const confirmResult = await Swal.fire({
      title: 'Konfirmasi Transaksi',
      html: `
        <div class="text-left text-sm mt-4 space-y-2">
          <p><strong>Layanan:</strong> ${serviceLabel}</p>
          ${serviceType !== 'donasi' ? `<p><strong>No. Rekening:</strong> ${rekening}</p>` : ''}
          <p><strong>Tujuan:</strong> ${recipientName || rekening}</p>
          <p><strong>Nominal:</strong> Rp ${new Intl.NumberFormat('id-ID').format(rawAmount)}</p>
          ${note ? `<p><strong>Catatan:</strong> ${note}</p>` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Ya, Kirim Sekarang',
      cancelButtonText: 'Batal',
    });

    if (!confirmResult.isConfirmed) return;

    // Tampilkan SweetAlert2 untuk minta PIN Transaksi
    const { value: pin, isDismissed } = await Swal.fire({
        title: 'Masukkan PIN Transaksi',
        input: 'password',
        inputLabel: 'Masukkan 6 digit PIN rahasia Anda',
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
            popup: 'rounded-2xl shadow-xl p-6 font-sans',
            input: 'text-center text-3xl tracking-[1em] pl-[1.1em] font-bold py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-900 max-w-xs mx-auto',
            confirmButton: 'px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg outline-none border-0 cursor-pointer flex-1',
            cancelButton: 'px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl transition-all outline-none border-0 cursor-pointer flex-1',
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

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      const res = await fetch(`${API_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          to_account: rekening || 'DONASI',
          destination_account: rekening, // added for backend validation
          account_number: rekening, // Khusus P2P Endpoint baru
          amount: rawAmount,
          note: note,
          service_type: serviceType,
          service_label: serviceLabel,
          recipient_name: recipientName || rekening,
          pin: pin // Kirim PIN ke backend untuk divaidasi
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Gagal melakukan transaksi");

      Swal.fire({
        icon: 'success',
        title: 'Transaksi Berhasil!',
        text: `${serviceLabel} sebesar Rp ${new Intl.NumberFormat('id-ID').format(rawAmount)} berhasil.`,
        confirmButtonColor: '#059669'
      });

      const timeStr = new Date().toLocaleString("id-ID", { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      }) + " WIB";

      onSuccess({
        id: data.transaction_id || `TRX-${Date.now()}`,
        time: timeStr,
        service: serviceLabel,
        title: strukTitle,
        amount: rawAmount,
        to_account: rekening || undefined,
        recipient_name: recipientName || data.receiver_name || data.recipient_name || rekening,
        note: note,
        description: note,
      });
      onClose();
      // Reset form
      setRekening(""); setRecipientName(recipientLabel || ""); setAmount(""); setRawAmount(0); setNote("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: "100%", opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[serviceType] || colorMap.transfer}`}>
                  {iconMap[serviceType] || iconMap.transfer}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{serviceLabel}</h3>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                  {error}
                </div>
              )}
              
              {serviceType !== 'donasi' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Rekening Tujuan</label>
                  <input 
                    type="text" 
                    value={rekening}
                    onChange={(e) => setRekening(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                    placeholder="Contoh: 1001234567" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115e59]/20 focus:border-[#115e59] outline-none transition-all"
                  />
                  {isVerifying && <p className="text-sm text-blue-500 mt-1 flex items-center gap-1"><Loader2 className="animate-spin w-4 h-4"/> Memverifikasi rekening...</p>}
                  {!isVerifying && recipientName && serviceType === 'transfer' && !error && (
                    <p className="text-sm text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Transfer ke: {recipientName}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {serviceType === 'donasi' ? 'Nama Campaign / Penerima' : 'Nama Penerima'}
                </label>
                <input 
                  type="text" 
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  readOnly={serviceType === 'transfer'}
                  placeholder={serviceType === 'donasi' ? 'Contoh: Reboisasi Kalimantan' : (serviceType === 'transfer' ? 'Otomatis terisi jika nomor valid' : 'Contoh: Nama Penerima')} 
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all ${serviceType === 'transfer' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-[#115e59]/20 focus:border-[#115e59]'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">Rp</span>
                  <input 
                    type="text" 
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0" 
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all font-bold text-lg ${
                      rawAmount > userBalance 
                        ? 'border-red-500 text-red-600 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:ring-2 focus:ring-[#115e59]/20 focus:border-[#115e59]'
                    }`}
                  />
                </div>
                {rawAmount > userBalance && (
                  <p className="text-red-500 text-xs font-bold mt-1">Saldo Anda tidak mencukupi (Sisa: Rp {new Intl.NumberFormat('id-ID').format(userBalance)})</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan (Opsional)</label>
                <input 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Bayar hutang" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115e59]/20 focus:border-[#115e59] outline-none transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading || rawAmount > userBalance}
                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 text-white ${
                  isLoading || rawAmount > userBalance ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#115e59] hover:bg-[#064e3b] shadow-[#115e59]/20'
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : serviceLabel + ' Sekarang'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
