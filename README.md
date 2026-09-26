# Portfolio Refactoring (Week 3 - Bootstrap 5 Integration)

**Pengembang:** Jody Siahaan  
**NIM:** 12S24039  
**Program Studi:** S1 Sistem Informasi / S1 Informatika - Institut Teknologi Del  

---

## 🚀 Ringkasan Pembaruan Week 3
Pada praktikum Week 3 ini, proyek *Personal Portfolio & Service Portal* dikembangkan dengan mengintegrasikan framework Bootstrap 5.3+ dan komponen kustom CSS lanjutan tanpa merusak struktur semantik HTML.

### 📊 Tabel Komparasi: Sebelum vs Sesudah Integrasi Framework

| Parameter / Area | Sebelum (Minggu 2 - Raw HTML/CSS) | Sesudah (Minggu 3 - Bootstrap 5 + Custom CSS) |
| :--- | :--- | :--- |
| **Tata Letak (Layout)** | Manual CSS Flexbox/Block statis | Grid responsif 12-kolom berbasis Flexbox (`col-sm`, `col-md`, `col-lg`) |
| **Navigasi** | Menu daftar sederhana tanpa responsivitas | Navbar `sticky-top` dengan tombol hamburger *collapse* interaktif |
| **Desain Kartu Proyek** | Elemen kartu polos berbasis CSS biasa | Bootstrap `.card` dengan *badge*, tombol modal, dan transisi *hover* |
| **Formulir Kontak** | Elemen input standar tanpa validasi visual | Modern Floating Labels (`.form-floating`), kelompok input, & validasi visual |
| **Modal Detail** | Tidak tersedia / Link eksternal biasa | Bootstrap Modal Popup interaktif (`.modal`) |
| **Pengaturan Tema** | Warna Statis di CSS | Menggunakan 6+ CSS Variables (`:root`) untuk tema terpusat |

---

## 🌐 Tautan Live Demo
Situs web terpublikasi aktif di GitHub Pages:  
👉 **https://[USERNAME-GITHUB-ANDA].github.io/ppw-2026-week2-12S24039/**