import Link from "next/link";
import { LockKeyhole, Leaf } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-green-200 selection:text-green-900">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-12 text-center border border-gray-100">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100/50 shadow-inner">
          <LockKeyhole className="w-10 h-10 text-green-700" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Verifikasi Keamanan</h2>
        <p className="text-gray-500 mb-10 text-[15px] leading-relaxed">
          Kami telah mengirimkan kode OTP ke nomor WhatsApp Anda <br/>
          <span className="font-semibold text-gray-800">+62 812 •••• ••••</span>
        </p>

        <form className="space-y-8">
          <div className="flex justify-between gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900 bg-gray-50 focus:bg-white"
                placeholder="-"
              />
            ))}
          </div>

          <div className="text-sm text-gray-500">
            Belum menerima kode? <button type="button" className="text-green-700 font-bold hover:text-green-800 transition-colors">Kirim ulang (00:59)</button>
          </div>

          <Link href="/register/success" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-base font-bold text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-all transform hover:scale-[1.02]">
            Verifikasi
          </Link>
        </form>

        <div className="mt-10 p-5 bg-green-50/50 rounded-2xl flex items-start text-left border border-green-100/50">
          <Leaf className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-bold text-green-900 block mb-1">Kenapa WhatsApp?</span>
            Kami menggunakan WhatsApp untuk mengurangi jejak karbon dari SMS tradisional.
          </p>
        </div>
      </div>
    </div>
  );
}