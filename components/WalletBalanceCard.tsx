"use client";

import { useState } from "react";
import { Wallet, Copy, Check, Plus, ArrowUpRight } from "lucide-react";
import { formatIDR, copyToClipboard } from "@/utils/format";

interface WalletBalanceCardProps {
  balance: number;
  accountNumber: string;
  userName?: string;
  onTopUpClick?: () => void;
  onTransferClick?: () => void;
}

export default function WalletBalanceCard({
  balance,
  accountNumber,
  userName = "Nasabah Lestari",
  onTopUpClick,
  onTransferClick,
}: WalletBalanceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!accountNumber) return;
    await copyToClipboard(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden h-full w-full bg-gradient-to-br from-[#064e3b] via-[#115e59] to-[#0f766e] text-white rounded-[24px] p-6 shadow-xl shadow-emerald-950/20 border border-white/10 group transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
      {/* Premium Glassmorphic Decorative Circles */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/15 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[190px]">
        {/* Top Section: Wallet Icon & Brand name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <Wallet size={20} className="text-emerald-300 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-emerald-200/80 font-bold leading-none">Eco-Wallet</p>
              <h4 className="font-black text-sm text-white mt-1">GreenBanking</h4>
            </div>
          </div>

        </div>

        {/* Middle Section: Balance Display */}
        <div className="my-5">
          <span className="text-emerald-200 text-xs font-semibold tracking-wide">Saldo Utama</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-sans tracking-tight text-white mt-1 drop-shadow-md">
            {formatIDR(balance)}
          </h2>
        </div>

        {/* Bottom Section: Account number & Actions */}
        <div className="flex items-end justify-between pt-2 border-t border-white/10 mt-2">
          <div>
            <span className="text-[10px] text-emerald-200/70 font-semibold uppercase tracking-wider block">ID Nasabah / No. Rekening</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 mt-0.5 text-emerald-100 font-mono text-sm hover:text-white transition-colors group/btn"
              title="Copy Rekening"
            >
              <span>{accountNumber || "—"}</span>
              {copied ? (
                <Check size={14} className="text-emerald-300" />
              ) : (
                <Copy size={12} className="opacity-60 group-hover/btn:opacity-100 transition-opacity" />
              )}
            </button>
            <span className="text-[10px] text-emerald-300/80 font-medium block mt-1.5 truncate max-w-[150px] sm:max-w-[200px]">
              {userName}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {onTransferClick && (
              <button
                onClick={onTransferClick}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white transition-all hover:scale-105"
                title="Transfer"
              >
                <ArrowUpRight size={16} />
              </button>
            )}
            {onTopUpClick && (
              <button
                onClick={onTopUpClick}
                className="flex items-center gap-1.5 bg-white text-[#064e3b] font-bold px-4 py-2 rounded-xl text-xs shadow-md hover:bg-emerald-50 hover:shadow-lg transition-all hover:scale-105"
              >
                <Plus size={14} />
                <span>Top Up</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
