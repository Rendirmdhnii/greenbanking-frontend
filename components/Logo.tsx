import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 group">
      <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105">
        <img src="/logo.svg" alt="GreenBanking Logo" className="w-full h-full object-contain drop-shadow-md" />
      </div>
      <span className="font-extrabold text-xl tracking-tight text-emerald-900">
        Green<span className="text-emerald-600">Banking</span>
      </span>
    </Link>
  );
}
