import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-green-200 selection:text-green-900">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-12 text-center border border-gray-100">
        <div className="relative w-32 h-32 mx-auto mb-10">
          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20"></div>
          <div className="relative w-full h-full bg-green-50 rounded-full flex items-center justify-center border border-green-100">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Pendaftaran Berhasil!</h2>
        <p className="text-gray-500 text-[15px] mb-12 leading-relaxed">
          Selamat datang di Green Banking. Akun Anda telah berhasil dibuat dan siap digunakan untuk bertransaksi sekaligus menyelamatkan bumi.
        </p>

        <Link href="/login" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-base font-bold text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-all transform hover:scale-[1.02]">
          Masuk ke Dashboard
        </Link>
      </div>
    </div>
  );
}
