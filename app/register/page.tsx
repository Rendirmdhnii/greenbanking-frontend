"use client";
 
import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // Validation States
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setPasswordConfirmError("");
    setErrorMsg("");

    let isValid = true;

    // Name Validation
    if (!name.trim()) {
      setNameError("Nama lengkap wajib diisi.");
      isValid = false;
    }

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

    // Password confirmation match validation
    if (password !== passwordConfirm) {
      setPasswordConfirmError("Konfirmasi kata sandi tidak cocok.");
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          setErrorMsg(Array.isArray(firstError) ? (firstError as string[])[0] : String(firstError));
        } else {
          setErrorMsg(data.error || data.message || "Registrasi gagal.");
        }
        setLoading(false);
        return;
      }

      // Simpan token & redirect
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setSuccess(true);

      // Redirect ke dashboard setelah 2 detik
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      console.error("Register error:", err);
      setErrorMsg("Gagal terhubung ke server. Pastikan Laravel berjalan.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
        <div className="w-full max-w-md bg-white border border-gray-100/80 rounded-3xl shadow-xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
            <CheckCircle size={32} className="text-[#059669]" />
          </div>
          <h2 className="text-2xl font-serif font-black text-emerald-900 tracking-tight mb-2">Registrasi Berhasil!</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Selamat! Akun Anda telah terdaftar di GreenBanking Nusantara. Mengalihkan ke dashboard...
          </p>
          <Loader2 size={24} className="animate-spin text-[#059669] mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 via-white to-emerald-50/30 p-4 relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none"></div>

      {/* Main Centered Card Container */}
      <div className="w-full max-w-md bg-white border border-gray-100/80 rounded-3xl shadow-xl shadow-gray-100/40 p-8 sm:p-10 relative z-10 hover:shadow-2xl transition-shadow duration-500">
        
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group mb-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 border border-emerald-100/50 shadow-sm mx-auto">
              <img src="/logo.svg" alt="GreenBanking Logo" className="w-9 h-9 object-contain" />
            </div>
          </Link>
          <h2 className="text-2xl font-serif font-black text-emerald-900 tracking-tight mb-1.5">
            Mulai Langkah Hijau Anda
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            Daftar sekarang untuk masa depan bumi yang berkelanjutan
          </p>
        </div>

        {/* ─── Error Notification ─── */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs mb-5 text-center font-semibold animate-shake">
            {errorMsg}
          </div>
        )}

        {/* ─── Registration Form ─── */}
        <form onSubmit={handleRegister} className="space-y-4 mb-6">
          
          {/* Full Name Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Nama Lengkap</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                required
                className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all bg-gray-50/30 ${
                  nameError 
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-emerald-100/50 focus:border-[#059669]'
                }`}
              />
            </div>
            {nameError && (
              <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">
                {nameError}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                required
                className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all bg-gray-50/30 ${
                  emailError 
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-emerald-100/50 focus:border-[#059669]'
                }`}
              />
            </div>
            {emailError && (
              <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Kata Sandi</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                required
                className={`w-full pl-11 pr-12 py-3 border rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all bg-gray-50/30 ${
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
              <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">
                {passwordError}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ulangi kata sandi"
                value={passwordConfirm}
                onChange={(e) => { setPasswordConfirm(e.target.value); setPasswordConfirmError(""); }}
                required
                className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all bg-gray-50/30 ${
                  passwordConfirmError 
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-emerald-100/50 focus:border-[#059669]'
                }`}
              />
            </div>
            {passwordConfirmError && (
              <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">
                {passwordConfirmError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-150 transform hover:scale-[1.01] active:scale-95 shadow-md shadow-emerald-600/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Mendaftar...</>
            ) : (
              'Daftar Sekarang'
            )}
          </button>

        </form>

        {/* Redirect to Login */}
        <p className="text-center text-xs text-gray-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[#059669] font-extrabold hover:underline ml-1">
            Login di sini
          </Link>
        </p>

        {/* T&C Footer */}
        <p className="mt-8 text-[10px] text-gray-400 text-center leading-normal px-4">
          Dengan mendaftar, Anda menyetujui <span className="underline cursor-pointer">Syarat &amp; Ketentuan</span> serta <span className="underline cursor-pointer">Kebijakan Privasi</span> GreenBanking.
        </p>

      </div>
    </div>
  );
}
