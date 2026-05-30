import React from 'react';

interface ProductCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  targetFunding: string | number;
  progressPercentage?: number;
}

export default function ProductCard({ imageUrl, title, description, targetFunding, progressPercentage = 0 }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Gambar Produk */}
      <div className="w-full h-48 bg-gray-100 relative">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Konten Card */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate" title={title}>
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
            ></div>
          </div>
        </div>

        {/* Target Pendanaan */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            Target Pendanaan
          </p>
          <p className="font-black text-emerald-600 text-lg">
            {typeof targetFunding === 'number' 
              ? `Rp ${targetFunding.toLocaleString('id-ID')}` 
              : targetFunding}
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-4 mt-5">
          <button className="flex-1 px-4 py-2.5 text-sm font-bold text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
            Investasi
          </button>
          <button className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
            Donasi
          </button>
        </div>
      </div>
    </div>
  );
}
