"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Zap, ArrowDownRight } from "lucide-react";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  isLoading?: boolean;
}

const QUICK_AMOUNTS = [
  { value: 10000, label: "10rb" },
  { value: 50000, label: "50rb" },
  { value: 100000, label: "100rb" },
  { value: 250000, label: "250rb" },
  { value: 500000, label: "500rb" },
  { value: 1000000, label: "1jt" },
];

export default function TopUpModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: TopUpModalProps) {
  const [displayAmount, setDisplayAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [error, setError] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDisplayAmount("");
      setRawAmount(0);
      setError("");
    }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (!rawValue) {
      setDisplayAmount("");
      setRawAmount(0);
      setError("");
      return;
    }
    const val = parseInt(rawValue, 10);
    setRawAmount(val);
    setDisplayAmount(new Intl.NumberFormat("id-ID").format(val));
    if (val < 10000) {
      setError("Nominal minimal adalah Rp 10.000");
    } else if (val > 50000000) {
      setError("Nominal maksimal adalah Rp 50.000.000");
    } else {
      setError("");
    }
  };

  const handleQuickAmountSelect = (val: number) => {
    setRawAmount(val);
    setDisplayAmount(new Intl.NumberFormat("id-ID").format(val));
    if (val < 10000) {
      setError("Nominal minimal adalah Rp 10.000");
    } else {
      setError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount < 10000) {
      setError("Nominal minimal adalah Rp 10.000");
      return;
    }
    if (rawAmount > 50000000) {
      setError("Nominal maksimal adalah Rp 50.000.000");
      return;
    }
    onSubmit(rawAmount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          {/* Dark Overlay with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                  <ArrowDownRight size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Top Up Saldo</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Quick Amount Selectors */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Pilih Nominal Cepat
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleQuickAmountSelect(item.value)}
                      className={`py-3 px-2 rounded-xl text-center font-bold text-sm border-2 transition-all duration-200 ${
                        rawAmount === item.value
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input nominal */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Nominal Top Up
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    value={displayAmount}
                    onChange={handleAmountChange}
                    placeholder="10.000"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl outline-none transition-all font-black text-xl text-gray-900 placeholder:text-gray-300 ${
                      error
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20 text-red-600"
                        : "border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {error ? (
                  <p className="text-red-500 text-xs font-bold mt-1.5">{error}</p>
                ) : (
                  <p className="text-[10px] text-gray-400">Minimal top up Rp 10.000</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 font-bold py-3.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || rawAmount < 10000}
                  className={`flex-1 font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-white ${
                    isLoading || rawAmount < 10000
                      ? "bg-gray-300 cursor-not-allowed shadow-none"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Konfirmasi Top Up</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
