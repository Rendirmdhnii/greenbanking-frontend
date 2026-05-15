"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function SuperAdminSecureLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin-internal-secure/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard/admin";
      } else {
        setError(data.error || "Akses ditolak. God Mode membutuhkan kredensial khusus.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#052e16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-3xl opacity-50" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-3 text-white font-bold text-3xl mb-8 group">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-md border border-gray-800">
            <ShieldCheck size={28} className="text-emerald-400" />
          </div>
          <span className="tracking-tight">GOD <span className="text-red-500">MODE</span></span>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-black/80 backdrop-blur-md py-10 px-6 sm:px-10 rounded-[2rem] shadow-2xl border border-gray-800">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">Super Admin Access</h2>
            <p className="text-sm text-gray-400 mt-2">Masuk untuk mendapatkan kontrol absolut.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-900/50 text-red-400 p-4 rounded-xl text-sm font-medium border border-red-800 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Omnipotent Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
                placeholder="superadmin@..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Master Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin text-white" size={20} />
              ) : (
                <>
                  Initialize Override <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-500 transition-colors">
              <Home size={16} /> Return to Safety
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
