// FORCE TRIGGER DEPLOYMENT VER MARET 2026 - REVISI UAS FIX FINAL
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  QrCode, Image as ImageIcon, Flashlight, Leaf
} from "lucide-react";
import { useRef, useState } from "react";
import TransferModal from "@/components/TransferModal";
import StrukModal from "@/components/StrukModal";
import { useUserContext } from "@/hooks/useUserData";

export default function QrisPage() {
  const userHook = useUserContext();
  const { refreshUserData } = userHook;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [strukData, setStrukData] = useState<any>(null);

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        // In a real app, this would decode the QR and process payment
        // For demo, show transfer modal after image selection
        setTimeout(() => {
          setShowTransfer(true);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col items-center justify-center p-8"
        >
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
            {/* Header section */}
            <div className="p-6 text-center border-b border-gray-50">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">Pindai QRIS</h2>
              <p className="text-sm text-gray-500">Arahkan kamera ke kode QR untuk membayar</p>
            </div>

            {/* Camera Area / Selected Image */}
            <div className="bg-black/90 h-80 relative flex items-center justify-center">
              {selectedImage ? (
                <img src={selectedImage} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80')] opacity-30 mix-blend-overlay blur-sm"></div>
                  
                  {/* Scan Frame */}
                  <div className="absolute w-56 h-56 border-2 border-[#a3e635] rounded-3xl relative z-10 bg-transparent shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#a3e635] rounded-tl-3xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#a3e635] rounded-tr-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#a3e635] rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#a3e635] rounded-br-3xl"></div>
                    
                    {/* Laser animation line */}
                    <motion.div 
                      animate={{ y: [0, 210, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-full h-0.5 bg-[#a3e635] shadow-[0_0_12px_#a3e635] absolute top-0"
                    ></motion.div>
                  </div>
                </>
              )}
            </div>

            {/* Panel Kontrol */}
            <div className="p-6 flex justify-around items-center">
              <button onClick={handleGalleryClick} className="flex flex-col items-center gap-2 text-gray-500 hover:text-[#064e3b] transition-colors">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center hover:bg-emerald-50 transition-colors">
                  <ImageIcon size={20} />
                </div>
                <span className="text-xs font-semibold">Galeri</span>
              </button>
              
              <button onClick={() => setShowTransfer(true)} className="flex flex-col items-center gap-2 text-[#064e3b]">
                <div className="w-16 h-16 bg-[#115e59] rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/20 text-white hover:bg-[#064e3b] transition-colors">
                  <QrCode size={28} />
                </div>
                <span className="text-xs font-bold">Pindai</span>
              </button>
              
              <button onClick={() => setFlashOn(!flashOn)} className={`flex flex-col items-center gap-2 transition-colors ${flashOn ? 'text-yellow-600' : 'text-gray-500 hover:text-[#064e3b]'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${flashOn ? 'bg-yellow-50' : 'bg-gray-50 hover:bg-emerald-50'}`}>
                  <Flashlight size={20} />
                </div>
                <span className="text-xs font-semibold">{flashOn ? 'Nyala' : 'Senter'}</span>
              </button>
            </div>
            
            {/* Eco Badge */}
            <div className="bg-emerald-50 px-6 py-4 flex items-center gap-3">
              <Leaf size={24} className="text-[#16a34a] flex-shrink-0" />
              <p className="text-[11px] font-bold text-[#064e3b] leading-tight">
                Penjelasan Dampak: Inisiatif Hijau dengan transaksi QRIS memangkas 100% jejak karbon dari struk fisik kertas.
              </p>
            </div>
          </div>

          {/* Hidden file input for gallery */}
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            onChange={handleFileSelect} 
            className="hidden" 
          />
        </motion.div>

        <TransferModal 
          isOpen={showTransfer} 
          onClose={() => { setShowTransfer(false); setSelectedImage(null); }} 
          onSuccess={(data) => {
            setStrukData(data);
            refreshUserData();
            setSelectedImage(null);
          }}
          serviceType="transfer"
          serviceLabel="Pembayaran QRIS"
          strukTitle="Struk Pembayaran QRIS"
        />
        <StrukModal 
          isOpen={!!strukData} 
          onClose={() => setStrukData(null)} 
          data={strukData} 
        />
    </>
  );
}
