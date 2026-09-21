# Portofolio Profesional - Jody Alfonso Siahaan

Proyek ini merupakan aplikasi web portofolio profesional satu halaman (*Single Page Application*) yang dirancang menggunakan HTML5 Semantik dan CSS3 Modern sesuai dengan standar WCAG 2.2 Level AA Accessibility.

---

## 📌 Fitur Utama

* **Struktur Semantik Lanjut:** Menggunakan elemen HTML5 seperti `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, dan `<footer>`.
* **Aksesibilitas Tinggi (WCAG 2.2 AA):**
  * Fitur *Skip to main content* untuk pengguna *screen reader* dan navigasi *keyboard*.
  * Kontras warna yang memenuhi standar keterbacaan tinggi.
  * Indikator *focus visible* yang jelas pada setiap elemen interaktif.
* **Aturan Warna 60-30-10:**
  * **60% (Netral/Canvas):** Light background & kartu (`#f8fafc` & `#ffffff`).
  * **30% (Sekunder/Primary):** Ocean Blue (`#0369a1` & `#0284c7`).
  * **10% (Aksen):** Emerald Green (`#059669`) untuk tombol aksi dan *highlight* status.
* **Tabel Semantik Berstandar:** Lengkap dengan `<caption>`, `<thead>`, `<tbody>`, `<tfoot>`, serta atribut `scope` (`col`/`row`).
* **Formulir Konsultasi Interaktif:**
  * Pengelompokan dengan `<fieldset>` dan `<legend>`.
  * Menggunakan 8 jenis tipe input (`text`, `email`, `tel`, `number`, `select`, `radio`, `checkbox`, `textarea`).
  * Umpan balik form (*toast notification*) tanpa menggunakan `alert()` native.
* **Desain Responsif:** Menggunakan CSS Grid & Flexbox yang optimal untuk perangkat *mobile*, *tablet*, hingga *desktop*.

---

## 📁 Struktur Berkas

```text
portofolio-jody/
├── index.html     # Berkas struktur utama HTML
├── style.css      # Berkas styling CSS3
├── profile.jpg    # Foto profil pengguna
└── README.md      # Dokumentasi proyek