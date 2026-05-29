"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Download, Printer } from "lucide-react";
import { useRef } from "react";

export default function StrukModal({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) {
  const strukRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    const printContent = strukRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk - ${data.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 32px; max-width: 380px; margin: 0 auto; color: #1a1a1a; }
            .header { text-align: center; padding-bottom: 16px; border-bottom: 2px dashed #e5e5e5; }
            .logo { font-weight: 900; font-size: 20px; color: #064e3b; margin-bottom: 4px; }
            .title { font-size: 16px; font-weight: 700; margin: 8px 0 4px; }
            .success { color: #16a34a; font-weight: 600; font-size: 13px; }
            .details { padding: 16px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
            .row .label { color: #888; }
            .row .value { font-weight: 600; text-align: right; }
            .total { border-top: 2px dashed #e5e5e5; padding-top: 16px; margin-top: 8px; }
            .total .value { font-size: 22px; font-weight: 800; color: #064e3b; }
            .footer { text-align: center; font-size: 11px; color: #aaa; padding-top: 16px; border-top: 1px solid #eee; margin-top: 16px; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">GreenBanking Nusantara</div>
            <div class="title">${data.service === 'Transfer Dana' ? 'Struk Transfer Dana' : (data.title || 'Struk Pembayaran')}</div>
            <div class="success">✓ Transaksi Berhasil</div>
          </div>
          <div class="details">
            <div class="row"><span class="label">ID Transaksi</span><span class="value">${data.id}</span></div>
            <div class="row"><span class="label">Waktu</span><span class="value">${data.time}</span></div>
            <div class="row"><span class="label">Layanan</span><span class="value">${data.service}</span></div>
            ${data.recipient_name ? `<div class="row"><span class="label">Penerima</span><span class="value">${data.recipient_name}</span></div>` : ''}
            ${data.to_account ? `<div class="row"><span class="label">No. Rekening</span><span class="value">${data.to_account}</span></div>` : ''}
            <div class="row"><span class="label">Catatan</span><span class="value" style="word-break: break-word; max-width: 200px; text-align: right;">${data.note || data.description || data.notes || "-"}</span></div>
          </div>
          <div class="total">
            ${data.discount ? `<div class="row"><span class="label" style="color:#16a34a;">Potongan Eco-Points</span><span class="value" style="color:#16a34a;">- Rp ${data.discount.toLocaleString('id-ID')}</span></div>` : ''}
            <div class="row">
              <span class="label" style="font-weight:700;">Total Nominal</span>
              <span class="value">Rp ${((data.amount || 0) - (data.discount || 0)).toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div class="footer">
            Terima kasih telah menggunakan GreenBanking Nusantara<br/>
            Platform Perbankan Hijau Indonesia
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10"
          ref={strukRef}
        >
          {/* Top Receipt Edge Pattern */}
          <div className="h-4 w-full bg-emerald-50 relative flex items-center justify-center overflow-hidden">
            <div className="absolute w-full h-full opacity-50" style={{ backgroundImage: "radial-gradient(circle, #fff 4px, transparent 4px)", backgroundSize: "12px 12px", backgroundPosition: "-6px -6px" }}></div>
          </div>

          <div className="p-8 text-center bg-emerald-50 border-b border-emerald-100">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {data.title || (data.service === 'Transfer Dana' ? 'Struk Transfer Dana' : 'Struk Pembayaran')}
            </h2>
            <p className="text-emerald-700 font-semibold text-sm">Transaksi Berhasil</p>
          </div>

          <div className="p-8 space-y-4 bg-white border-b border-gray-100 border-dashed">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">ID Transaksi</span>
              <span className="text-gray-900 font-semibold font-mono text-xs">{data.id}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Waktu</span>
              <span className="text-gray-900 font-semibold text-xs text-right max-w-[200px]">{data.time}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Layanan</span>
              <span className="text-gray-900 font-semibold">{data.service}</span>
            </div>
            {data.recipient_name && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Penerima</span>
                <span className="text-gray-900 font-semibold">{data.recipient_name}</span>
              </div>
            )}
            {data.to_account && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">No. Rekening</span>
                <span className="text-gray-900 font-semibold">{data.to_account}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Catatan</span>
              <span className="text-gray-900 font-semibold text-right max-w-[200px] break-words">{data.note || data.description || data.notes || "-"}</span>
            </div>
          </div>

          <div className="p-8 bg-gray-50">
            {data.discount > 0 && (
              <div className="flex justify-between items-center mb-2 text-green-600 font-medium">
                <span>Potongan Eco-Points:</span>
                <span>- Rp {data.discount?.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 font-bold">Total Nominal</span>
              <span className="text-2xl font-bold text-[#064e3b]">Rp {((data.amount || 0) - (data.discount || 0)).toLocaleString('id-ID')}</span>
            </div>
            
            

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                Tutup
              </button>
              <button onClick={handlePrint} className="flex-1 py-3 bg-[#115e59] text-white font-bold rounded-xl hover:bg-[#064e3b] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#115e59]/20">
                <Printer size={18} /> Cetak
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
