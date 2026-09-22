# Refactoring Personal Portfolio & Services Website

## Deskripsi Proyek
Proyek ini merupakan pengembangan dan refactoring dari website portofolio pribadi (*Week 2*) menggunakan **Bootstrap 5.3** dan **Custom CSS Overrides** (*Week 3*). Aplikasi web ini dirancang untuk menampilkan profil pengembang, koleksi proyek/portofolio secara interaktif, serta formulir pengajuan layanan/kontak modern.

Website disusun secara terstruktur dengan menerapkan sistem tata letak responsif (*12-column Grid*), komponen UI Bootstrap (Navbar Sticky, Kartu Portofolio, Modal Dialog, dan Floating Labels), serta konsistensi visual melalui penggunaan *CSS Variables* (`:root`) tanpa mengganggu *class* bawaan framework.

---

## Identitas Pengembang
- **Nama:** Jody Alfonso Siahaan
- **NIM:** 12S24039
- **Program Studi:** S1 Sistem Informasi
- **Mata Kuliah:** Pemrograman dan Pengujian Web (12S3101)
- **Tahun Akademik:** 2026/2027

---

## 📌 Fitur Utama Website
1. **Header & Navigasi Responsif**: Menggunakan Bootstrap Navbar Sticky dengan *hamburger toggle* untuk perangkat seluler.
2. **Hero Section**: Tampilan penyambutan dengan integrasi profil dan latar belakang visual modern.
3. **Portofolio Interaktif (Grid 12-Kolom)**: Menampilkan proyek-proyek berbasis UI/UX, Java OOP, Jaringan/Keamanan, dan Web Development.
4. **Modal Dialog Detail**: Menampilkan rincian teknis tiap proyek saat tombol detail diklik tanpa berpindah halaman.
5. **Formulir Layanan Modern**: Dilengkapi *Floating Labels*, *Input Groups* berikon, serta fitur validasi formulir langsung (*HTML5 & Bootstrap Validation*).
6. **Mikro-Interaksi & Hover Effect**: Transisi animasi pada tombol dan *card lift effect* saat kursor diabaikan di atas elemen.

---

## Tabel Komparasi: Sebelum vs Sesudah Integrasi Framework

| Fitur / Komponen | Sebelum (Minggu 2 - Plain HTML/CSS) | Sesudah (Minggu 3 - Bootstrap 5 & Custom CSS) |
| :--- | :--- | :--- |
| **Tata Letak (Layout)** | Manual CSS Flexbox/Float biasa | Bootstrap 12-Column Responsive Grid (`row-cols-*`, `col-lg-*`) |
| **Navigasi** | Menu navigasi statis | Sticky Responsive Navbar dengan tombol *Hamburger Toggle Collapse* |
| **Elemen Proyek** | Daftar proyek statis biasa | Kartu Interaktif (`.card`) lengkap dengan Badge Teknologi |
| **Interaktivitas Detail** | Membuka link baru / halaman terpisah | Pop-up **Bootstrap Modal Dialog** tanpa berpindah halaman |
| **Formulir Kontak** | Elemen `<input>` kustom polos | *Floating Labels* (`.form-floating`), *Input Groups* berikon, dan validasi visual (`.was-validated`) |
| **Theming & Variabel** | Warna hardcoded | Terstandarisasi via **CSS Variables (`:root`)** |

---

## 📁 Struktur Berkas
```text
ppw-2026-week2-12S24039/
├── index.html          # Struktur HTML5 dengan Bootstrap 5.3 CDN
├── custom-style.css    # Variabel CSS (:root) dan kustomisasi gaya
├── profile.jpg         # Foto profil pengembang
└── README.md           # Dokumentasi proyek & tabel komparasi