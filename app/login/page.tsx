"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ─── State Login Manual ───
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ─── GUARD: Jika sudah login, langsung ke Dashboard ───
  useEffect(() => {
    let isMounted = true;

    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user && isMounted) {
          window.location.href = "/dashboard";
          return;
        }
      } catch (e) {
        console.error("Session check error:", e);
      }
      if (isMounted) setIsChecking(false);
    };

    checkExistingSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && isMounted) {
        window.location.href = "/dashboard";
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ═══════════════════════════════════════════════════
  //  LOGIN GOOGLE — Supabase OAuth → sync ke MySQL
  // ═══════════════════════════════════════════════════
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Gagal login:", error);
      Swal.fire({ icon: 'error', title: 'Login Gagal', text: 'Terjadi kesalahan saat login dengan Google.', confirmButtonColor: '#059669' });
      setIsLoggingIn(false);
    }
  };

  // ═══════════════════════════════════════════════════
  //  LOGIN MANUAL — Email + Password → MySQL → Sanctum
  // ═══════════════════════════════════════════════════
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || data.message || "Login gagal");
        setManualLoading(false);
        return;
      }

      // Simpan token Sanctum ke localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Redirect ke dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Manual login error:", err);
      setErrorMsg("Gagal terhubung ke server. Pastikan Laravel berjalan.");
      setManualLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#064e3b] rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <p className="text-gray-400 text-sm">Mengecek sesi login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-green-950 flex-col justify-between p-14">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80"
            alt="Hutan"
            className="w-full h-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-900/60 to-transparent" />
        </div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-3 w-max">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="GreenBanking Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">GreenBanking Nusantara</span>
          </Link>
        </div>
        <div className="relative z-10 max-w-lg">
          <blockquote className="text-5xl font-serif italic text-white mb-8 leading-tight">
            &quot;Wariskan Alam, Tumbuhkan Kekayaan.&quot;
          </blockquote>
          <p className="text-lg text-green-100/90 font-light leading-relaxed">
            Platform keuangan hijau pertama di Indonesia. Investasi, donasi, dan kelola keuangan Anda secara berkelanjutan.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.svg" alt="GreenBanking Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-2xl text-green-900 tracking-tight">GreenBanking Nusantara</span>
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight text-center">Selamat Datang</h2>
          <p className="text-gray-500 text-center mb-8">Masuk untuk mengakses dashboard Anda.</p>

          {/* ─── Error Message ─── */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 text-center">
              {errorMsg}
            </div>
          )}

          {/* ─── Login Manual Form ─── */}
          <form onSubmit={handleManualLogin} className="space-y-4 mb-6">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={manualLoading}
              className="w-full bg-[#064e3b] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#065f46] transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {manualLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Masuk...</>
              ) : (
                'Masuk dengan Email'
              )}
            </button>
          </form>

          {/* ─── Separator ─── */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ─── Login Google ─── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                Menghubungkan ke Google...
              </>
            ) : (
              <>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Masuk dengan Google
              </>
            )}
          </button>

          {/* ─── Register Link ─── */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link href="/register" className="text-[#064e3b] font-bold hover:underline">
              Daftar Sekarang
            </Link>
          </p>

          <p className="mt-6 text-xs text-gray-400 text-center">
            Dengan masuk, Anda menyetujui Syarat &amp; Ketentuan GreenBanking Nusantara.
          </p>
        </div>
      </div>
    </div>
  );
}