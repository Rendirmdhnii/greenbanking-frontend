import React from 'react';

interface TierBadgeProps {
  tier: string;
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const getBadgeStyle = (tierName: string) => {
    const t = tierName.toLowerCase();
    
    if (t === 'platinum') {
      // Warna abu-abu mengkilap/silver
      return 'bg-gradient-to-r from-slate-200 to-gray-300 text-slate-800 border border-slate-300 shadow-sm';
    }
    
    if (t === 'gold') {
      // Warna kuning/emas
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    }
    
    if (t === 'silver') {
      // Warna abu-abu muda
      return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
    
    // Default (misalnya untuk Bronze atau tier standar)
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center ${getBadgeStyle(tier)}`}>
      {tier}
    </span>
  );
}
