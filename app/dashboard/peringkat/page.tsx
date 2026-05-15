"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Trophy, Globe, Leaf, Loader2
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

  return (
    <>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8 max-w-5xl mx-auto w-full"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Peringkat Dampak Sosial</h1>
              <p className="text-sm text-gray-500">Lihat kontribusi Anda dibandingkan dengan nasabah lainnya</p>
            </div>
          </div>

          <div className="bg-[#115e59] text-white rounded-3xl p-6 mb-8 flex items-center gap-6 shadow-lg shadow-emerald-900/20">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Globe size={32} className="text-emerald-200" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm mb-1">Dampak Kolektif Nasabah</p>
              <h2 className="text-4xl font-serif font-extrabold tracking-tight">
                {loading ? '...' : `${(totalCollective * 0.5).toFixed(0)} kg CO₂e`}
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-serif font-bold text-gray-900 text-xl">Leaderboard Eco-Champion</h3>
              <span className="text-xs font-semibold text-[#115e59] bg-emerald-50 px-3 py-1 rounded-full">Global</span>
            </div>
            
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-8 text-center flex items-center justify-center gap-2 text-gray-400">
                  <Loader2 size={16} className="animate-spin" /> Memuat leaderboard...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Belum ada data leaderboard</div>
              ) : (
                leaderboard.map((user) => {
                  const isCurrentUser = user.email === userEmail;
                  
                  if (isCurrentUser) {
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 px-6 bg-[#115e59] text-white border-y border-[#064e3b] shadow-inner relative z-10 scale-[1.02] rounded-lg my-1">
                        <div className="flex items-center gap-4">
                          <span className="w-8 font-bold text-emerald-200 text-center">#{user.rank}</span>
                          <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-emerald-300 flex items-center justify-center bg-white text-[#115e59] font-bold">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <span className="font-bold font-serif text-lg">{user.name} <span className="text-[10px] bg-emerald-400 text-[#064e3b] px-2 py-0.5 rounded-full ml-2 font-sans tracking-wide">ANDA</span></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-100">{user.eco_points}</span>
                          <Leaf size={16} className="text-emerald-300" />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 px-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 font-bold text-gray-400 text-center">#{user.rank}</span>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                          {getInitialsFromName(user.name)}
                        </div>
                        <span className="font-bold text-gray-900">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#115e59]">{user.eco_points}</span>
                        <Leaf size={14} className="text-[#115e59]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
    </>
  );
}
