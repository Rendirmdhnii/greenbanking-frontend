"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import { 
  ArrowDownLeft, ArrowUpRight, QrCode, Heart, Zap, FileText, Download, TrendingUp, X, Printer
} from "lucide-react";
import { useUserContext } from "@/hooks/useUserData";
import { formatIDR } from "@/utils/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function RiwayatPage() {
  const userHook = useUserContext();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchTransactions = async (pageNum: number, type: string, replace = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/transactions?page=${pageNum}&type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (replace) {
        setTransactions(data.data || []);
      } else {
        setTransactions(prev => [...prev, ...(data.data || [])]);
      }
      setHasMore(data.current_page < data.last_page);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, filterType, true);
    setPage(1);
  }, [filterType]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage, filterType, false);
  };

  const handlePrintStatement = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const rows = transactions.map(trx => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:12px;color:#666;">${new Date(trx.created_at).toLocaleString("id-ID")}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;">${trx.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:11px;color:#888;">${trx.transaction_id}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:${trx.type === 'in' || trx.type === 'admin_addition' ? '#16a34a' : '#1a1a1a'}">
          ${trx.type === 'in' || trx.type === 'admin_addition' ? '+' : '-'}Rp ${Number(trx.amount).toLocaleString('id-ID')}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#16a34a;font-weight:600;font-size:12px;">${trx.status}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>e-Statement - GreenBanking Nusantara</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a1a; }
            h1 { color: #064e3b; font-size: 24px; margin-bottom: 4px; }
            .subtitle { color: #888; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f4f7f6; padding: 10px 12px; text-align: left; font-size: 12px; color: #064e3b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 2px solid #064e3b; font-size: 11px; color: #aaa; text-align: center; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>GreenBanking Nusantara</h1>
          <div class="subtitle">e-Statement Riwayat Transaksi • Dicetak pada ${new Date().toLocaleString("id-ID")}</div>
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Deskripsi</th>
                <th>ID Transaksi</th>
                <th style="text-align:right">Nominal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">
            Dokumen ini digenerate secara otomatis oleh sistem GreenBanking Nusantara.<br/>
            Platform Perbankan Hijau Indonesia
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'in': 
      case 'admin_addition': 
        return <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><ArrowDownLeft size={20} /></div>;
      case 'out': 
      case 'admin_deduction':
        return <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center"><ArrowUpRight size={20} /></div>;
      case 'investasi': return <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><TrendingUp size={20} /></div>;
      case 'donasi': return <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center"><Heart size={20} /></div>;
      case 'tagihan': return <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center"><Zap size={20} /></div>;
      case 'qris': return <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><QrCode size={20} /></div>;
      default: return <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center"><FileText size={20} /></div>;
    }
  };

  const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'in', label: 'Uang Masuk' },
    { id: 'out', label: 'Uang Keluar' },
    { id: 'investasi_donasi', label: 'Investasi & Donasi' },
  ];

  return (
    <>
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-8 max-w-5xl mx-auto w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Riwayat Transaksi</h1>
              <p className="text-gray-500 mt-1">Pantau semua aktivitas keuangan dan dampak Anda bulan ini.</p>
            </div>
            <button onClick={handlePrintStatement} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
              <Printer size={16} /> Unduh e-Statement
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden" ref={tableRef}>
            <div className="flex flex-wrap gap-4 p-6 border-b border-gray-100 bg-gray-50/50">
              {tabs.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filterType === t.id ? 'bg-[#115e59] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-gray-100 min-h-[300px]">
              {transactions.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">Belum ada transaksi.</div>
              )}
              {loading && transactions.length === 0 && (
                <div className="p-4 space-y-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded-lg w-3/4" /><div className="h-3 bg-gray-100 rounded-lg w-1/2" /></div>
                      <div className="h-5 bg-gray-200 rounded-lg w-24" />
                    </div>
                  ))}
                </div>
              )}
              {(() => {
                // Group transactions by date
                const groups: { label: string; items: any[] }[] = [];
                const now = new Date();
                const todayStr = now.toDateString();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                let currentGroup = '';
                transactions.forEach(trx => {
                  const d = new Date(trx.created_at);
                  let label = '';
                  if (d.toDateString() === todayStr) label = 'Hari Ini';
                  else if (d >= weekAgo) label = 'Minggu Ini';
                  else label = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);
                  if (label !== currentGroup) {
                    groups.push({ label, items: [] });
                    currentGroup = label;
                  }
                  groups[groups.length - 1].items.push(trx);
                });
                return groups.map((group, gi) => (
                  <div key={gi}>
                    <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group.label}</span>
                    </div>
                    {group.items.map((trx: any, idx: number) => (
                <div key={idx} onClick={() => setSelectedTrx(trx)} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    {getIcon(trx.type)}
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-[#115e59] transition-colors">{trx.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{new Date(trx.created_at).toLocaleString("id-ID")}</p>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <p className="text-xs text-gray-400 font-mono">{trx.transaction_id}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold font-serif text-lg ${trx.type === 'in' || trx.type === 'admin_addition' ? 'text-green-600' : 'text-red-500'}`}>
                      {trx.type === 'in' || trx.type === 'admin_addition' ? '+' : '-'}{formatIDR(trx.amount)}
                    </p>
                    <p className="text-xs text-[#16a34a] font-bold mt-1 flex items-center justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span> {trx.status}
                    </p>
                  </div>
                </div>
              ))}
                  </div>
                ));
              })()}
            </div>
          </div>
          
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button onClick={loadMore} disabled={loading} className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all hover:shadow-md disabled:opacity-50">
                {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          )}

        </motion.div>

        <AnimatePresence>
          {selectedTrx && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedTrx(null)}
            >
              <motion.div 
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100"
              >
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-serif font-bold text-gray-900 text-xl">Detail Transaksi</h3>
                  <button onClick={() => setSelectedTrx(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex justify-center">{getIcon(selectedTrx.type)}</div>
                    <h4 className="font-bold text-gray-900 mt-3">{selectedTrx.title}</h4>
                    <p className={`font-serif font-bold text-3xl mt-2 ${selectedTrx.type === 'in' || selectedTrx.type === 'admin_addition' ? 'text-green-600' : 'text-red-500'}`}>
                      {selectedTrx.type === 'in' || selectedTrx.type === 'admin_addition' ? '+' : '-'}{formatIDR(selectedTrx.amount)}
                    </p>
                  </div>
                  <div className="space-y-4 text-sm bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID Transaksi</span>
                      <span className="font-mono font-medium text-gray-900">{selectedTrx.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Waktu Transaksi</span>
                      <span className="font-medium text-gray-900">{new Date(selectedTrx.created_at).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipe</span>
                      <span className="font-medium text-gray-900 capitalize">{selectedTrx.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-bold text-[#16a34a]">{selectedTrx.status}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </>
  );
}
