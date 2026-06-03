export const globalProjectImages: Record<string, string> = {
  // Produk Investasi
  "PLTS Atap Pabrik Manufaktur Sidoarjo": "https://images.unsplash.com/photo-1509391366360-2addb56a7d28?auto=format&fit=crop&q=80&w=800", // Panel Surya Pabrik
  "Fasilitas Biogas Peternakan Sapi Pujon": "https://images.unsplash.com/photo-1590272456672-005725091202?auto=format&fit=crop&q=80&w=800", // Peternakan Sapi
  "Pabrik Daur Ulang Plastik PET Surabaya": "https://images.unsplash.com/photo-1591196307300-84333d45bc88?auto=format&fit=crop&q=80&w=800", // Daur Ulang Plastik
  "Pembangkit Listrik Mikrohidro Blitar": "https://images.unsplash.com/photo-1469071569038-f155609335a1?auto=format&fit=crop&q=80&w=800", // Aliran Air/Sungai
  "Ekspansi Armada Logistik Motor Listrik": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800", // Motor Listrik
  "Pengolahan Limbah Agroforestri Batu": "https://images.unsplash.com/photo-1523348837708-15d4a09cfacb?auto=format&fit=crop&q=80&w=800", // Agroforestri
  "Reksa Dana Pasar Uang Hijau": "https://images.unsplash.com/photo-1591696206503-298a36c1e592?auto=format&fit=crop&q=80&w=800", // Grafik Keuangan Hijau
  "P2P Invoice Financing UMKM Daur Ulang": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", // Analisis Bisnis
  "Sukuk Ritel Hijau": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800", // Dokumen Keuangan

  // Produk Donasi
  "Darurat Reboisasi Jalur Pendakian Arjuno-Welirang": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800", // Hutan/Reboisasi
  "Sumur Bor Tenaga Surya Tanggap El Nino": "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?auto=format&fit=crop&q=80&w=800", // Tenaga Surya
  "Pembersihan Mikroplastik Sungai Brantas": "https://images.unsplash.com/photo-1584271854089-9bb3e5168e27?auto=format&fit=crop&q=80&w=800", // Sungai/Air
  "Rehabilitasi Mangrove Teluk Benoa Bali": "https://images.unsplash.com/photo-1551009175-8a68da93d5f9?auto=format&fit=crop&q=80&w=800", // Mangrove
  "Penyediaan Komposter Biogas Rumah Tangga": "https://images.unsplash.com/photo-1559329007-40ec44d1641a?auto=format&fit=crop&q=80&w=800", // Kompos/Biogas
};

export const fallbackImage = "/images/katalog/default-project.jpg";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const resolveImageUrl = (product: { title?: string; image_url?: string | null; image?: string | null } | null | undefined): string => {
  if (!product) {
    return fallbackImage;
  }

  const rawUrl = product.image_url || product.image;

  // 1. Gambar dari database (Upload Admin)
  if (rawUrl && rawUrl !== 'null' && rawUrl !== '') {
    let img = rawUrl;
    // Tambahkan base URL backend jika image_url hanya me-return path relatif
    if (img.startsWith('/storage')) {
      const backendHost = API_URL.replace(/\/api$/, '');
      img = `${backendHost}${img}`;
    } else if (!img.startsWith('http') && !img.startsWith('/images/')) {
      const backendHost = API_URL.replace(/\/api$/, '');
      img = `${backendHost}/storage/${img}`;
    }
    return img;
  }

  // 2. Gambar statis lokal untuk produk lama
  if (product.title && globalProjectImages[product.title]) {
    return globalProjectImages[product.title];
  }

  // 3. Fallback aman
  return fallbackImage;
};