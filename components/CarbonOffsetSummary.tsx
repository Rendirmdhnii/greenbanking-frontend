import React from 'react';

interface CarbonOffsetSummaryProps {
  offsetAmount: number | string;
}

export default function CarbonOffsetSummary({ offsetAmount }: CarbonOffsetSummaryProps) {
  return (
    <div className="relative bg-white rounded-2xl p-8 border border-emerald-100 shadow-sm overflow-hidden min-h-[200px] flex flex-col items-center justify-center group hover:shadow-md transition-shadow">
      {/* Decorative Icon Background (Sudut Kanan Atas) */}
      <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 pointer-events-none transform -rotate-12">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-40 h-40 text-emerald-600">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1.16 6.88-1.53 4.96-5.88 11.12-9.16 11.12z" />
        </svg>
      </div>
      
      {/* Soft Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-50 rounded-full blur-[50px] opacity-80 pointer-events-none"></div>

      {/* Main Content (Tengah) */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Ikon Lingkungan Kecil */}
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 shadow-sm border border-emerald-100 text-emerald-600">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1.16 6.88-1.53 4.96-5.88 11.12-9.16 11.12z" />
            <path d="M11 20v-5" />
          </svg>
        </div>
        
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Dampak Lingkungan
        </p>
        
        {/* Angka Besar + Satuan */}
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-5xl font-black text-gray-900 tracking-tighter">
            {typeof offsetAmount === 'number' ? offsetAmount.toLocaleString('id-ID') : offsetAmount}
          </span>
          <span className="text-lg font-bold text-emerald-600">
            Kg CO₂e
          </span>
        </div>
      </div>
    </div>
  );
}
