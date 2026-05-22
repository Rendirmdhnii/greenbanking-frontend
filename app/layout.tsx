import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoBank Nusantara - Green Banking Platform",
  description: "Masa depan perbankan hijau Indonesia untuk dampak sosial",
  icons: {
    icon: "/logo-greenbanking.png", // Memaksa tab browser memanggil logo kustom
    apple: "/logo-greenbanking.png",
  },
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
