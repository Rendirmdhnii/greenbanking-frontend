import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">{children}</body>
    </html>
  );
}
