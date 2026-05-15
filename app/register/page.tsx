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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== passwordConfirm) {
      setErrorMsg("Password dan konfirmasi tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

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
        // Laravel validation errors
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-sm mx-auto p-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrasi Berhasil!</h2>
          <p className="text-gray-500 text-sm mb-4">Akun Anda telah terdaftar di GreenBanking Nusantara. Mengalihkan ke dashboard...</p>
          <Loader2 size={20} className="animate-spin text-emerald-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-green-950 flex-col justify-between p-14">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80"
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
          <blockquote className="text-4xl font-serif italic text-white mb-6 leading-tight">
            &quot;Mulai Langkah Pertama Menuju Perubahan.&quot;
          </blockquote>
          <p className="text-lg text-green-100/90 font-light leading-relaxed">
            Daftarkan akun Anda dan mulai berinvestasi untuk masa depan yang lebih hijau.
          </p>
        </div>
      </div>

      {/* Right Panel — Register Form */}
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

          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight text-center">Buat Akun Baru</h2>
          <p className="text-gray-500 text-center mb-8">Isi data di bawah untuk mendaftar.</p>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
              />
            </div>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
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
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 6 karakter)"
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
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Konfirmasi Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#064e3b] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#065f46] transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Mendaftar...</>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[#064e3b] font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
