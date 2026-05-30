import React from 'react';

export interface LeaderboardUser {
  id: string | number;
  rank: number;
  name: string;
  avatar?: string;
  xp: number;
  tier: string;
}

interface LeaderboardTableProps {
  data: LeaderboardUser[];
}

export default function LeaderboardTable({ data }: LeaderboardTableProps) {
  // Menentukan warna latar belakang baris berdasarkan peringkat
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-50 hover:bg-amber-100 border-l-4 border-l-amber-400';
      case 2:
        return 'bg-slate-50 hover:bg-slate-100 border-l-4 border-l-slate-300';
      case 3:
        return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-400';
      default:
        return 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent';
    }
  };

  // Menentukan lencana angka peringkat (Emas, Perak, Perunggu)
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="w-8 h-8 rounded-full bg-amber-400 text-white font-black flex items-center justify-center shadow-md">1</span>;
      case 2:
        return <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 font-black flex items-center justify-center shadow-sm">2</span>;
      case 3:
        return <span className="w-8 h-8 rounded-full bg-orange-400 text-white font-black flex items-center justify-center shadow-sm">3</span>;
      default:
        return <span className="text-gray-500 font-bold w-8 text-center">{rank}</span>;
    }
  };

  // Menentukan warna badge untuk tier pengguna
  const getTierBadge = (tier: string) => {
    const t = tier.toLowerCase();
    if (t.includes('platinum') || t.includes('diamond')) {
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
    if (t.includes('gold') || t.includes('emas')) {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    if (t.includes('silver') || t.includes('perak')) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    if (t.includes('bronze') || t.includes('perunggu')) {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    // Default tier hijau/eco
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'; 
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80">
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4">Peringkat</th>
              <th className="px-6 py-4">Nama Pengguna</th>
              <th className="px-6 py-4">Poin (XP)</th>
              <th className="px-6 py-4">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data && data.length > 0 ? (
              data.map((user) => (
                <tr key={user.id} className={`transition-colors ${getRankStyle(user.rank)}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center w-max">
                      {getRankBadge(user.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-emerald-700">{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-black text-emerald-600">{user.xp.toLocaleString('id-ID')} XP</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black border uppercase tracking-wider ${getTierBadge(user.tier)}`}>
                      {user.tier}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-gray-500 bg-white">
                  Belum ada data peringkat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
