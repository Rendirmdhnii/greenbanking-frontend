import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GreenBanking - Masa Depan Keuangan Hijau",
  description: "Platform perbankan hijau pertama di Indonesia. Investasi berkelanjutan, donasi lingkungan, dan kelola keuangan Anda secara ramah lingkungan.",
  keywords: ["green banking", "eco bank", "investasi hijau", "perbankan berkelanjutan", "Indonesia"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">{children}</body>
    </html>
  );
}
