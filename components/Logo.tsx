import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 group">
      {/* Ikon Logo Kustom Green Banking */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-md shadow-emerald-500/20 text-white font-bold text-lg transition-transform group-hover:scale-105">
        🌿
      </div>
      {/* Teks Branding Nama Bank */}
      <div className="flex flex-col">
        <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">EcoBank</span>
        <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase -mt-1">Nusantara</span>
      </div>
    </Link>
  );
}
