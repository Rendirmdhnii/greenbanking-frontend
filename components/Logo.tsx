import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-[#064e3b] font-bold text-xl">
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#115e59] flex items-center justify-center relative">
        <Image src="/logo-ecobank.png" alt="GreenBanking Logo" fill className="object-cover" />
      </div>
      GreenBanking
    </Link>
  );
}
