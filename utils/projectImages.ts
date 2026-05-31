// Gambar fallback berbasis judul produk — menggunakan Unsplash agar tidak gagal
// walaupun gambar lokal sudah dihapus atau tidak tersedia
export const globalProjectImages: Record<string, string> = {
  // Produk lama (sudah tidak digunakan, tapi tetap ada sebagai safety net)
  "PLTS Atap Sidoarjo": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600",
  "Restorasi Mangrove Probolinggo": "https://images.unsplash.com/photo-1621450259223-233e7022d274?auto=format&fit=crop&q=80&w=600",
  "Pengepulan Sampah Surabaya": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600",
  "Pembangkit Angin Sidrap": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=600",
  "Konservasi Terumbu Karang Raja Ampat": "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600",
  "Bio-Gas Mandiri Malang": "https://images.unsplash.com/photo-1559329007-40ec44d1641a?auto=format&fit=crop&q=80&w=600",
  "Eco-Property Bond Jakarta": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
  // Produk baru dari ProductSeeder
  "PLTS Atap Pabrik Manufaktur Sidoarjo": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600",
  "Fasilitas Biogas Peternakan Sapi Pujon": "https://images.unsplash.com/photo-1559329007-40ec44d1641a?auto=format&fit=crop&q=80&w=600",
  "Pabrik Daur Ulang Plastik PET Surabaya": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600",
  "Pembangkit Listrik Mikrohidro Blitar": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=600",
  "Ekspansi Armada Logistik Motor Listrik": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600",
  "Pengolahan Limbah Agroforestri Batu": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600",
  "Reksa Dana Pasar Uang Hijau": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600",
  "P2P Invoice Financing UMKM Daur Ulang": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600",
  "Sukuk Ritel Hijau": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600",
  "Darurat Reboisasi Jalur Pendakian Arjuno-Welirang": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600",
  "Sumur Bor Tenaga Surya Tanggap El Nino": "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?auto=format&fit=crop&q=80&w=600",
  "Pembersihan Mikroplastik Sungai Brantas": "https://images.unsplash.com/photo-1584271854089-9bb3e5168e27?auto=format&fit=crop&q=80&w=600",
};

// Fallback global jika image_url dari API kosong/null dan judul tidak dikenali
export const fallbackImage = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600";
