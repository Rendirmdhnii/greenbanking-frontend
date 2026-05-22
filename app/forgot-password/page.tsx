"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { ArrowLeft, Mail, ShieldCheck, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      Swal.fire("Peringatan", "Harap masukkan email Anda.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Cek email ke backend
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memverifikasi email.");
      }

      // 2. Email valid, tampilkan modal input password baru menggunakan Swal
      const { value: newPassword } = await Swal.fire({
        title: "Reset Kata Sandi",
        text: "Email terverifikasi. Masukkan kata sandi baru Anda.",
        input: "password",
        inputPlaceholder: "Kata sandi baru (minimal 6 karakter)",
        inputAttributes: {
          minlength: "6",
          autocapitalize: "off",
          autocorrect: "off"
        },
        showCancelButton: true,
        confirmButtonText: "Simpan Sandi Baru",
        cancelButtonText: "Batal",
        confirmButtonColor: "#059669",
        cancelButtonColor: "#dc2626",
        background: "#ffffff",
        color: "#111827",
        preConfirm: (password) => {
          if (!password || password.length < 6) {
            Swal.showValidationMessage("Kata sandi minimal 6 karakter");
          }
          return password;
        }
      });

      // 3. Eksekusi ganti password jika user memasukkan password baru
      if (newPassword) {
        const resetRes = await fetch(`${API_URL}/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ email, password_baru: newPassword }),
        });

        const resetData = await resetRes.json();

        if (resetRes.ok) {
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: resetData.message || "Kata sandi berhasil direset. Silakan login.",
            confirmButtonColor: "#059669"
          }).then(() => {
            window.location.href = "/login";
          });
        } else {
          throw new Error(resetData.error || "Gagal mereset kata sandi.");
        }
      }
    } catch (error: any) {
      Swal.fire("Kesalahan", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-300 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/login" className="flex items-center justify-center gap-2 mb-6 text-emerald-600 hover:text-emerald-700 transition-colors font-semibold">
          <ArrowLeft size={20} />
          <span>Kembali ke Login</span>
        </Link>

        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-inner">
            <ShieldCheck size={32} className="text-emerald-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Lupa Kata Sandi?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Masukkan email Anda untuk melakukan reset.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-emerald-100/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={onForgotPasswordSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Alamat Email
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow bg-gray-50 hover:bg-white focus:bg-white"
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Verifikasi Email"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
