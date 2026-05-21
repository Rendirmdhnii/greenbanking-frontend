# 🍃 EcoBank Nusantara - Frontend Client

Repository ini memuat kode sumber (*source code*) sisi **Frontend Client** untuk aplikasi *Green Banking* bernama **EcoBank Nusantara**. Proyek ini dirancang menggunakan arsitektur *Decoupled System* yang terpisah sepenuhnya dari server backend, berfokus pada penyediaan antarmuka pengguna (*user interface*) yang responsif, dinamis, serta aman.

Proyek ini dikembangkan sebagai pemenuhan komponen tugas akhir / Ujian Akhir Semester (UAS) Kelompok 1 pada program studi **D3 Teknologi Informasi, Fakultas Vokasi, Universitas Brawijaya**.

---

## 🛠️ Spesifikasi Teknologi (Frontend Tech Stack)

Sistem antarmuka ini mengintegrasikan ekosistem teknologi modern berskala produksi:
* **Framework Utama:** Next.js (React Framework) menggunakan struktur *App Router* untuk optimalisasi rute dan performa rendering.
* **Utility-First CSS:** Tailwind CSS untuk efisiensi implementasi desain visual yang konsisten dan responsif.
* **State Management & Fetching:** Axios dan React Hooks untuk manajemen siklus data serta asinkronisasi komunikasi API.
* **Otentikasi Pihak Ketiga:** Supabase Auth SDK terintegrasi penuh dengan Google OAuth 2.0 Client.
* **Komponen Alert:** SweetAlert2 (Swal) untuk penyajian notifikasi transaksional yang interaktif.

---

## 👥 Struktur Organisasi Kelompok & Distribusi Peran

Untuk transparansi dan objektivitas penilaian akademis, berikut adalah rincian kontribusi teknis serta pembagian tanggung jawab masing-masing anggota kelompok pada repositori frontend:

| Nama Lengkap | NIM | Peran Utama | Deskripsi Kontribusi Teknis |
| :--- | :--- | :--- | :--- |
| **Muhammad Rendy Ramadhani** | **253140707111058** | **Lead Fullstack Developer** | **Penanggung jawab penuh arsitektur sistem.** Mengimplementasikan logika *Dynamic Redirect Auth* untuk deteksi lingkungan (*environment*), menghubungkan seluruh komponen *state* transaksional ke RESTful API, merancang struktur handling *form data* untuk penyesuaian saldo dan input produk baru, serta membangun seluruh arsitektur interaktif pada Halaman Dashboard Admin Panel (*God Mode*). |
| **Sofyan Muzakki** | 253140707111087 | Frontend Developer | Mengimplementasikan komponen UI statis untuk halaman *landing page* awal dan beberapa tata letak menu dasar berdasarkan aset desain. |
| **Krisna Aji Dharma Jati** | 253140707111078 | Frontend Developer | Menyusun struktur folder awal pada repositori frontend serta membantu integrasi gaya utilitas Tailwind CSS dasar. |
| **Desbellion Seccar Ramis** | 253140707111074 | UI/UX Designer | Menyediakan rancangan sketsa kawat (*wireframe*) dan desain visual awal pada Figma sebagai referensi tata letak antarmuka. |

---

## 🚀 Panduan Instalasi dan Pengoperasian Lokal

Pastikan komputer Anda telah terinstal Node.js (versi minimal 18.x), kemudian eksekusi perintah berikut pada terminal:

### 1. Instalasi Dependensi
```bash
npm install

### 2. Konfigurasi Environment Variables
Buat file konfigurasi lokal bernama .env.local pada direktori root proyek frontend, kemudian definisikan struktur variabel lingkungan berikut (untuk nilai asli, silakan merujuk pada kredensial penyedia layanan masing-masing secara privat):
NEXT_PUBLIC_SUPABASE_URL=xxxxxxxxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxx
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=xxxxxxxx

### 3. Menjalankan Server Pengembangan
Bash
npm run dev
Aplikasi frontend akan berjalan secara lokal dan dapat diakses melalui peramban pada alamat http://localhost:3000.

🎯 Fitur Antarmuka Unggulan yang Diujikan
Dynamic Redirect Auth: ]Implementasi logika berbasis window.location.hostname yang mendeteksi nama host secara real-time untuk mengalihkan callback token Supabase secara akurat, mencegah pengguna terlempar ke domain produksi secara paksa saat pengujian lokal.

Back-Office Admin Dashboard UI: Panel kendali khusus super admin yang menyajikan data statistik makro bank dan menyediakan penanganan aksi (action handling) murni untuk manipulasi akun nasabah.

Reactive State Synchronizer: Sinkronisasi status komponen frontend yang secara berkala melakukan fetching ulang ke database terpusat untuk menampilkan pembaruan saldo, riwayat transaksi, dan poin dampak sosial.