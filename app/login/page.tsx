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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Modal Error States
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  // ─── GUARD: jagani nek wes login, langsung uncalno ae nang Dashboard ───
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
  //  LOGIN GOOGLE — ben gak ribet gae email google ae
  // ═══════════════════════════════════════════════════
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg("");

    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const redirectUrl = isLocal 
      ? "http://localhost:3000/auth/callback" 
      : "https://projectuas.my.id/auth/callback";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Gagal login:", error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Login Gagal', 
        text: 'Terjadi kesalahan saat login dengan Google.', 
        confirmButtonColor: '#059669' 
      });
      setIsLoggingIn(false);
    }
  };

  // ═══════════════════════════════════════════════════
  //  LOGIN MANUAL — gawe email pasword biasa nek gk duwe google
  // ═══════════════════════════════════════════════════
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setErrorMsg("");

    let isValid = true;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Format email tidak valid (contoh: nama@email.com).");
      isValid = false;
    }

    // Password length validation
    if (password.length < 6) {
      setPasswordError("Password harus terdiri dari minimal 6 karakter.");
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    // Simulasi loading selama 2 detik sebelum call API
    await new Promise(resolve => setTimeout(resolve, 2000));

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
        setModalErrorMessage(data.error || data.message || "Email atau password yang Anda masukkan salah. Silakan coba lagi.");
        setShowErrorModal(true);
        setIsLoading(false);
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
      setModalErrorMessage("Gagal terhubung ke server. Pastikan backend Laravel berjalan.");
      setShowErrorModal(true);
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-md shadow-emerald-500/20">
            <span className="text-white font-extrabold text-lg">E</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">Mengecek sesi login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 via-white to-emerald-50/30 p-0 md:p-6 relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none"></div>

      {/* Main Centered Card Container */}
      <div className="w-full min-h-screen md:min-h-0 md:max-w-md bg-white border-0 md:border md:border-gray-100/80 rounded-none md:rounded-3xl shadow-none md:shadow-xl md:shadow-gray-100/40 p-6 sm:p-8 md:p-10 relative z-10 flex flex-col justify-center hover:shadow-2xl transition-shadow duration-500">
        
        {/* Logo and Header */}
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-block group mb-3 md:mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 border border-emerald-100/50 shadow-sm mx-auto">
              <img src="/logo.svg" alt="GreenBanking Logo" className="w-8 h-8 md:w-9 md:h-9 object-contain" />
            </div>
          </Link>
          <h2 className="text-xl md:text-2xl font-black text-emerald-900 tracking-tight mb-1 md:mb-1.5">
            Selamat Datang Kembali
          </h2>
          <p className="text-[11px] md:text-xs text-gray-400 font-medium">
            Masuk untuk mengakses layanan perbankan ramah lingkungan
          </p>
        </div>

        {/* ─── Error Notification ─── */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 md:py-3 rounded-2xl text-[11px] md:text-xs mb-5 md:mb-6 text-center font-semibold animate-shake">
            {errorMsg}
          </div>
        )}

        {/* ─── Login Form ─── */}
        <form onSubmit={handleManualLogin} className="space-y-3.5 md:space-y-4 mb-5 md:mb-6">
          
          {/* Email Input */}
          <div className="space-y-1 md:space-y-1.5">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 tracking-wide block ml-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="login-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                required
                className={`w-full pl-11 pr-4 py-3 md:py-3.5 border rounded-2xl text-xs md:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all bg-gray-50/30 ${
                  emailError 
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-emerald-100/50 focus:border-[#059669]'
                }`}
              />
            </div>
            {emailError && (
              <p className="text-[10px] md:text-[11px] text-red-500 font-semibold mt-1 ml-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1 md:space-y-1.5">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 tracking-wide block ml-1">Kata Sandi</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                required
                className={`w-full pl-11 pr-12 py-3 md:py-3.5 border rounded-2xl text-xs md:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all bg-gray-50/30 ${
                  passwordError 
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-emerald-100/50 focus:border-[#059669]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[10px] md:text-[11px] text-red-500 font-semibold mt-1 ml-1">
                {passwordError}
              </p>
            )}
          </div>
          
          {/* Forget Password link */}
          <div className="flex justify-end pt-0.5 md:pt-1">
            <Link 
              href="/forgot-password" 
              className="text-[10px] md:text-xs font-bold text-[#059669] hover:text-[#047857] transition-colors"
            >
              Lupa Kata Sandi?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 md:py-3.5 rounded-2xl text-xs md:text-sm transition-all duration-150 transform hover:scale-[1.01] active:scale-95 shadow-md shadow-emerald-600/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1 md:mt-2"
          >
            {isLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Masuk...</>
            ) : (
              'Masuk Akun'
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">atau</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* OAuth Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full flex justify-center items-center gap-2.5 md:gap-3 py-3 md:py-3.5 px-4 border border-gray-200 rounded-2xl shadow-sm text-xs md:text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              Menghubungkan...
            </>
          ) : (
            <>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Masuk dengan Google
            </>
          )}
        </button>

        {/* Sign Up Redirect */}
        <p className="mt-6 md:mt-8 text-center text-xs text-gray-500">
          Belum punya akun?{' '}
          <Link href="/register" className="text-[#059669] font-extrabold hover:underline ml-1">
            Daftar di sini
          </Link>
        </p>

        {/* T&C Footer */}
        <p className="mt-6 md:mt-8 text-[9px] md:text-[10px] text-gray-400 text-center leading-normal px-4">
          Dengan masuk, Anda menyetujui <span className="underline cursor-pointer">Syarat &amp; Ketentuan</span> serta <span className="underline cursor-pointer">Kebijakan Privasi</span> GreenBanking.
        </p>

      </div>

      {/* ─── Custom SweetAlert-like Error Modal ─── */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <div 
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowErrorModal(false)}
          ></div>
          
          {/* Modal Container */}
          <div className="bg-white border border-gray-100 rounded-[2rem] shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Silang / Exclamation Red Icon Container */}
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-500 animate-bounce">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="8" y2="12"></line>
                <line x1="12" x2="12.01" y1="16" y2="16"></line>
              </svg>
            </div>
            
            {/* Modal Title */}
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              Autentikasi Gagal
            </h3>
            
            {/* Modal Description */}
            <p className="text-xs text-gray-500 leading-relaxed mb-6 px-2">
              {modalErrorMessage}
            </p>
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-150 shadow-md shadow-red-500/10 hover:shadow-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}