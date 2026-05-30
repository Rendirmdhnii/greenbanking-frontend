"use client";
 
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Trophy, Globe, Leaf, Loader2, TrendingUp, Sparkles, Lightbulb, Zap, Car
} from "lucide-react";
import { useUserContext } from "@/hooks/useUserData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  email: string;
  account_number: string;
  balance: number;
  eco_points: number;
  impact_score: number;
  tier: string;
}

export default function PeringkatPage() {
  const userHook = useUserContext();
  const { userEmail, avatarUrl, initials, userName, userEcoPoints, impactScore } = userHook;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCollective, setTotalCollective] = useState(0);

  // Dynamic user details
  const displayUserName = userName || "Desbellion";
  const displayUserScore = impactScore || 2307.0;
  const displayUserCo2 = displayUserScore * 0.5;

  // Conversion calculations
  const treesCount = Math.round(displayUserCo2 / 22) || 45;
  const electricityHours = Math.round(displayUserCo2 / 0.04) || 1200;
  const drivingAvoidedKm = Math.round(displayUserCo2 / 0.12) || 350;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard || []);
          // Calculate collective impact from MySQL impact_score
          const totalImpact = (data.leaderboard || []).reduce((sum: number, u: LeaderboardEntry) => sum + (u.impact_score || 0), 0);
          setTotalCollective(totalImpact);
        }
      } catch (e) {
        console.error('Fetch leaderboard error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getInitialsFromName = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Find user's dynamic rank in the leaderboard
  const userRankIndex = leaderboard.findIndex(u => u.email === userEmail);
  const displayRank = userRankIndex !== -1 ? `#${leaderboard[userRankIndex].rank}` : "#12 Global";

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8"
      >
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center shadow-sm border border-yellow-100">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Peringkat & Dampak Sosial</h1>
            <p className="text-sm text-gray-500">Lihat kontribusi nyata Anda untuk kelestarian bumi</p>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Impact Cards & Conversions (Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. KARTU DAMPAK KOLEKTIF (Card Hijau Premium) */}
            <div className="bg-gradient-to-br from-[#064e3b] via-[#0f766e] to-[#115e59] text-white rounded-[2rem] p-8 shadow-xl shadow-emerald-950/15 relative overflow-hidden border border-white/10 flex flex-col justify-between min-h-[220px] group">
              {/* Glow Accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-400/20 transition-colors duration-500"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-emerald-200 text-sm font-medium tracking-wide flex items-center gap-2 mb-1.5">
                    <Globe size={16} className="text-emerald-300 animate-spin-slow" />
                    Dampak Kolektif Nasabah EcoBank
                  </p>
                  <h2 className="text-4xl md:text-5xl font-serif font-extrabold tracking-tight drop-shadow-sm">
                    {loading ? '64.313,5 kg CO2e' : `${Number(totalCollective > 0 ? totalCollective * 0.5 : 128627).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg CO2e`}
                  </h2>
                </div>

                {/* Trend Badge */}
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/10 shadow-sm">
                  <TrendingUp size={14} className="text-emerald-300" />
                  <span>+12% dari bulan lalu</span>
                </div>
              </div>

              {/* Mini SVG Line Chart */}
              <div className="relative z-10 mt-6 -mx-8 -mb-8 overflow-hidden rounded-b-[2rem]">
                <svg className="w-full h-16 opacity-35" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,20 Q15,4 30,12 T60,3 T85,14 T100,6 L100,20 L0,20 Z" fill="url(#chart-glow)" />
                  <path d="M0,20 Q15,4 30,12 T60,3 T85,14 T100,6" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* 3. SECTION BARU - "KONTRIBUSI SETARA" (Impact Conversion) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-600" />
                <h3 className="font-serif font-bold text-gray-900 text-lg">Kontribusi Setara Dampak Anda</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Card 1: Reforestasi */}
                <div className="bg-white border border-gray-100 hover:border-emerald-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Reforestasi</h4>
                    <p className="font-bold text-gray-900 text-base leading-snug">
                      Setara dengan menanam <span className="text-emerald-600 font-extrabold">{treesCount}</span> pohon dewasa
                    </p>
                  </div>
                </div>

                {/* Card 2: Penghematan Energi */}
                <div className="bg-white border border-gray-100 hover:border-amber-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Hemat Energi</h4>
                    <p className="font-bold text-gray-900 text-base leading-snug">
                      Setara dengan menghemat <span className="text-amber-600 font-extrabold">{electricityHours.toLocaleString('id-ID')}</span> jam lampu LED
                    </p>
                  </div>
                </div>

                {/* Card 3: Transportasi Hijau */}
                <div className="bg-white border border-gray-100 hover:border-blue-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Car size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Emisi Kendaraan</h4>
                    <p className="font-bold text-gray-900 text-base leading-snug">
                      Menghindari <span className="text-blue-600 font-extrabold">{drivingAvoidedKm}</span> km perjalanan mobil BBM
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT: Leaderboard Section (Span 1) */}
          <div className="lg:col-span-1 flex flex-col h-full">
            
            {/* 2. LEADERBOARD ECO-CHAMPION CONTAINER */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between flex-1 min-h-[500px]">
              
              {/* Leaderboard Header */}
              <div>
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-gray-900 text-lg">Leaderboard Eco-Champion</h3>
                  <span className="text-[10px] font-bold tracking-widest text-[#115e59] bg-emerald-50 px-2.5 py-1 rounded-full uppercase">Global</span>
                </div>

                {/* Scrollable Leaderboard List with Hover Effects */}
                <div className="divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 size={16} className="animate-spin" /> Memuat leaderboard...
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Belum ada data leaderboard</div>
                  ) : (
                    leaderboard.map((user) => {
                      const isCurrentUser = user.email === userEmail;
                      
                      let rankColor = "text-gray-400";
                      let rankBadge = "";
                      if (user.rank === 1) {
                        rankColor = "text-yellow-500 text-lg drop-shadow-sm";
                        rankBadge = " 🥇";
                      } else if (user.rank === 2) {
                        rankColor = "text-gray-400 text-base";
                        rankBadge = " 🥈";
                      } else if (user.rank === 3) {
                        rankColor = "text-amber-600 text-base";
                        rankBadge = " 🥉";
                      }

                      return (
                        <div 
                          key={user.id} 
                          className={`flex items-center justify-between p-4 px-5 transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:bg-emerald-50/20 hover:shadow-sm ${
                            isCurrentUser 
                              ? 'bg-emerald-50 border-l-4 border-[#115e59]' 
                              : user.rank <= 3 
                                ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' 
                                : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 font-bold text-center text-xs ${rankColor}`}>#{user.rank}</span>
                            <div className={`w-8 h-8 rounded-full flex items-shrink-0 items-center justify-center font-bold text-xs ${
                              isCurrentUser
                                ? 'bg-[#115e59] text-white border border-[#064e3b]'
                                : user.rank === 1 
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                                  : 'bg-gray-50 text-gray-600 border border-gray-200'
                            }`}>
                              {isCurrentUser && initials ? initials : getInitialsFromName(user.name)}
                            </div>
                            <span className={`font-bold text-xs truncate max-w-[120px] ${isCurrentUser ? 'text-[#064e3b]' : 'text-gray-800'}`}>
                              {user.name}{rankBadge}
                              {isCurrentUser && <span className="text-[8px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full ml-1.5 font-sans font-bold">ANDA</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black text-xs ${isCurrentUser ? 'text-[#064e3b]' : 'text-[#115e59]'}`}>
                              {Number(user.impact_score).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                            </span>
                            <Leaf size={12} className={isCurrentUser ? 'text-[#064e3b]' : 'text-[#115e59]'} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 2. COMPONENT "PERINGKAT SAYA" (Sticky/Highlight at Bottom) */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="bg-gradient-to-br from-[#064e3b] via-[#0f766e] to-[#115e59] text-white p-4 rounded-2xl shadow-lg border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Peringkat Saya
                    </span>
                    <span className="text-xs font-mono text-emerald-200 font-bold">
                      {displayRank}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm border border-emerald-300/40 bg-white text-[#115e59] font-bold flex items-center justify-center text-xs">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          initials || "D"
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs truncate max-w-[120px]">{displayUserName}</h4>
                        <p className="text-[10px] text-emerald-200">Nasabah Lestari</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-black text-sm text-yellow-300">
                        {Number(displayUserScore).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                      </span>
                      <Leaf size={14} className="text-yellow-300" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </motion.div>
    </>
  );
}
