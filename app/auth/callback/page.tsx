"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

/**
 * ═══════════════════════════════════════════════════════════════
 * HALAMAN TRANSIT AUTENTIKASI — /auth/callback
 * ═══════════════════════════════════════════════════════════════
 * 
 * Alur PKCE (Proof Key for Code Exchange):
 * 
 * 1. User klik "Masuk dengan Google" di /login
 * 2. Browser → Supabase Auth → Google → User pilih akun
 * 3. Google → Supabase Auth (tukar auth code → tokens)
 * 4. Supabase redirect ke: /auth/callback?code=XXXXX
 * 5. Halaman INI menangkap ?code= dari URL
 * 6. Panggil exchangeCodeForSession(code) → session tersimpan
 * 7. Redirect ke /dashboard ✅
 * 
 * ═══════════════════════════════════════════════════════════════
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;

    const handleAuthCallback = async () => {
      try {
        // ─── LANGKAH 1: Ambil 'code' dari URL query string ───
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorParam = url.searchParams.get('error');
        const errorDesc = url.searchParams.get('error_description');

        // Jika ada error dari provider (Google/Supabase)
        if (errorParam) {
          console.error('Auth error from provider:', errorParam, errorDesc);
          if (isMounted) {
            setStatus('error');
            setErrorMsg(errorDesc || errorParam || 'Autentikasi gagal');
          }
          return;
        }

        // ─── LANGKAH 2: Biarkan Supabase otomatis menukar code ───
        if (code) {
          console.log('🔐 Menunggu Supabase otomatis menukar authorization code...');
          // Jangan panggil exchangeCodeForSession secara manual karena `detectSessionInUrl: true` 
          // sudah otomatis melakukannya di background.
          // Kita hanya perlu menunggu onAuthStateChange.
          return;
        }

        // ─── FALLBACK: Tidak ada code, cek session yang sudah ada ───
        console.log('⚠️ Tidak ada code di URL, mengecek session yang sudah ada...');
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          console.log('✅ Session ditemukan, redirect ke dashboard');
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
          return;
        }

        // Juga dengarkan onAuthStateChange sebagai safety net
        // (untuk kasus hash fragment / implicit flow fallback)
        const hashHasToken = window.location.hash.includes('access_token');
        if (hashHasToken) {
          console.log('🔑 Ditemukan token di hash, menunggu Supabase parse...');
          // Supabase akan otomatis parse hash dan trigger onAuthStateChange
          // Tunggu sampai 5 detik
          return;
        }

        // Tidak ada code DAN tidak ada session → gagal
        if (isMounted) {
          setStatus('error');
          setErrorMsg('Tidak ada data autentikasi. Silakan login ulang.');
        }

      } catch (err: any) {
        console.error('Auth callback exception:', err);
        if (isMounted) {
          setStatus('error');
          setErrorMsg(err?.message || 'Terjadi kesalahan tak terduga');
        }
      }
    };

    // Jalankan handler
    handleAuthCallback();

    // ─── SAFETY NET: onAuthStateChange untuk implicit flow / hash fallback ───
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        console.log(`✅ onAuthStateChange: ${event} detected`);
        setStatus('success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
    });

    // ─── TIMEOUT: Jika setelah 10 detik masih processing ───
    const timeout = setTimeout(() => {
      if (isMounted && status === 'processing') {
        setStatus('error');
        setErrorMsg('Timeout — autentikasi terlalu lama. Silakan coba lagi.');
      }
    }, 10000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center font-sans">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Logo */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          status === 'error' ? 'bg-red-100' : 'bg-[#064e3b] animate-pulse'
        }`}>
          {status === 'error' ? (
            <AlertCircle size={28} className="text-red-500" />
          ) : status === 'success' ? (
            <CheckCircle size={28} className="text-white" />
          ) : (
            <span className="text-white font-bold text-2xl">G</span>
          )}
        </div>

        {/* Status Messages */}
        {status === 'processing' && (
          <>
            <div className="flex items-center gap-3 text-[#064e3b] justify-center mb-3">
              <Loader2 className="animate-spin" size={20} />
              <span className="font-semibold">Memproses autentikasi...</span>
            </div>
            <p className="text-gray-400 text-sm">Menukar kode otorisasi dari Google menjadi sesi login.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex items-center gap-3 text-emerald-600 justify-center mb-3">
              <CheckCircle size={20} />
              <span className="font-semibold">Login berhasil!</span>
            </div>
            <p className="text-gray-400 text-sm">Mengalihkan ke Dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Autentikasi Gagal</h2>
            <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
            <div className="space-y-3">
              <button
                onClick={() => { window.location.href = '/login'; }}
                className="w-full bg-[#064e3b] text-white py-3 px-6 rounded-xl font-bold hover:bg-[#115e59] transition-colors"
              >
                Kembali ke Login
              </button>
              <p className="text-xs text-gray-400">
                Pastikan Client Secret Google sudah diupdate di Supabase Dashboard.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
