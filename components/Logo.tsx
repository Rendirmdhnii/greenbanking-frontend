import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 group">
      {/* Pertahankan komponen ikon daun bulat hijau yang sudah sukses */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-md text-white font-bold text-lg transition-transform group-hover:scale-105">
        🍃
      </div>
      {/* Kembalikan Nama Asli Proyek: GreenBanking */}
      <span className="font-extrabold text-xl tracking-tight text-emerald-900">
        Green<span className="text-emerald-600">Banking</span>
      </span>
    </Link>
  );
}
