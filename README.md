<p align="center">
  <img src="asset/zliritdo-logo-icon.svg" alt="ZliritDo Icon" width="100" />
  <br />
  <img src="asset/zliritdo-wordmark.svg" alt="ZliritDo Logo" width="340" />
</p>

<p align="center">
  <strong>Make time for what matters — Time-Targeted Daily Discipline & Focus Tracker</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-Semantic5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-Vanilla_Design_System-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Web_Audio_API-Synthesized_Chimes-62edbd?style=flat-square" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/Storage-LocalStorage-07182c?style=flat-square" alt="LocalStorage" />
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA Ready" />
</p>

<p align="center">
  <a href="https://dickyandrean07.github.io/ZliritDO/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-dickyandrean07.github.io-10b981?style=for-the-badge&logo=github&logoColor=white" alt="Live Demo ZliritDo" />
  </a>
</p>

<p align="center">
  🌐 <strong>Live Production URL:</strong> <a href="https://dickyandrean07.github.io/ZliritDO/">https://dickyandrean07.github.io/ZliritDO/</a>
</p>

---

## 📌 Ringkasan Eksekutif

**ZliritDo** adalah aplikasi web produktivitas dan pelacak disiplin harian berbasis komitmen waktu (*Time-Targeted Daily Discipline & Focus Tracker*). Aplikasi ini dirancang untuk mengatasi fenomena *to-do list paralysis* dengan mengalihkan fokus pengguna dari sekadar mencoret daftar tugas acak menjadi memenuhi kuota waktu nyata untuk hal-hal yang benar-benar bermakna. Dibangun menggunakan arsitektur *Zero-Dependency Vanilla Web*, ZliritDo menawarkan performa secepat kilat (*sub-millisecond state update*), perlindungan privasi 100% lokal via `localStorage`, dan audio sintetis interaktif berbasis Web Audio API tanpa aset eksternal.

---

## 🎯 Masalah vs Solusi

| Tantangan | Solusi di ZliritDo |
| :--- | :--- |
| **To-Do List Terlalu Mengambang** — Banyak to-do list hanya berisi checklist tanpa acuan berapa lama aktivitas harus dijalankan secara konsisten. | **Target Waktu Presisi**: Menetapkan target komitmen waktu per aktivitas (misal: Coding 2 jam, Olahraga 1 jam) dengan bilah kemajuan progres harian interaktif. |
| **Distraksi Selama Sesi Berjalan** — Multitasking sering memecah fokus di tengah pengerjaan tugas. | **Immersive Focus Engine**: Mode fokus layar penuh terisolasi dengan cincin progres konik, timer raksasa, dan tombol aksi terpusat. |
| **Ketergantungan Audio Eksternal & Latensi** — Suara timer sering gagal termuat saat offline atau jaringan lambat. | **Web Audio API Chimes**: Efek suara notifikasi sintetis instan yang digenerate langsung oleh browser secara programatis tanpa file audio eksternal. |
| **Privasi & Hambatan Registrasi** — Pengguna malas membuat akun dan khawatir data aktivitas pribadinya terlacak server pihak ketiga. | **Zero-Login & Local-First**: Semua data tersimpan aman di peramban pengguna, lengkap dengan fitur ekspor cadangan ke file JSON kapan saja. |

---

## ✨ Fitur Unggulan

### 1. Manajemen Target Waktu & Progress Realtime
- **Bilah Kemajuan Otomatis** — Visualisasi persentase waktu yang telah diselesaikan terhadap target harian.
- **Quick Switch Fokus** — Tombol langsung `▶ Fokus` pada tiap kartu aktivitas untuk langsung memulai sesi dengan 1 ketukan.
- **Status Capaian Komitmen** — Indikator visual hijau instan ketika target waktu harian suatu aktivitas tercapai.

### 2. Active Focus Engine & Immersive Mode
- **Status Live Glow** — Indikator status visual aktif (*"FOCUSING NOW"*) dengan aksen *mint glow*.
- **Remaining Today Counter** — Kalkulasi otomatis sisa waktu yang dibutuhkan untuk mencapai target hari ini.
- **Mode Layar Penuh Bebas Distraksi** — Tampilan fokus bersih yang menyembunyikan elemen dashboard untuk konsentrasi mendalam.

### 3. Pelacak Kebiasaan & Siklus Hari Baru
- **Daily Streak Counter (🔥)** — Melacak konsistensi hari berturut-turut dalam mempertahankan disiplin.
- **Siklus Hari Baru Aman** — Tombol reset aman untuk menutup hari, mengarsipkan akumulasi waktu ke riwayat, dan menambah streak tanpa menghapus daftar aktivitas.

### 4. Manajemen Data & Keandalan Offline
- **JSON Backup & Restore** — Ekspor seluruh basis data aktivitas dan riwayat sesi ke file JSON lokal dalam 1 klik.
- **Audio Sintetis Adaptif** — Opsi toggle suara aktif/senyap dengan sintesis gelombang audio murni.
- **PWA Ready** — Dilengkapi manifest untuk diinstal langsung ke perangkat seluler maupun desktop.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 (Semantic)** — Struktur markup semantik, aksesibel, dan ramah SEO.
- **CSS3 (Vanilla Modern)** — Token variabel CSS, layout CSS Grid & Flexbox, efek *Frosted Glassmorphism*, dan animasi mikro halus.
- **Google Fonts (Inter)** — Tipografi modern dan bersih dengan keterbacaan tinggi.

### Logic & Client Engine
- **JavaScript (ES6+)** — Arsitektur State Store reaktif murni tanpa framework, manipulasi DOM modular, dan interval timer presisi.
- **Web Audio API** — Sintesis audio frekuensi terprogram (*sine wave chimes*) tanpa beban HTTP request file suara.
- **Web Storage API (`localStorage`)** — Persistensi data lokal nir-latensi.

### Infrastruktur & Deployment
- **Git & GitHub Pages** — Version control dan static hosting production-grade.
- **Web App Manifest (`manifest.json`)** — Standar instalasi Progressive Web App.

---

## 🚀 Panduan Menjalankan Secara Lokal

### Prasyarat
- Peramban web modern apa saja (Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari).
- Opsional: VS Code dengan ekstensi *Live Server* atau HTTP server lokal sederhana.

### 1. Kloning Repositori
```bash
git clone https://github.com/DickyAndrean07/ZliritDO.git
cd ZliritDO
```

### 2. Menjalankan Aplikasi
Karena dibangun secara *pure vanilla*, aplikasi ini tidak membutuhkan `npm install` atau proses build:

**Opsi A — Langsung Buka File:**
Cukup klik dua kali file [index.html](file:///c:/2026/to%20do%20list/index.html) di file manager Anda untuk langsung menjalankannya di browser.

**Opsi B — Menjalankan via Local Server (Rekomendasi PWA):**
```bash
# Menggunakan npx serve
npx serve .

# Atau menggunakan python
python -m http.server 3000
```
Buka browser pada alamat `http://localhost:3000`.

---

## 📂 Struktur Folder

```text
ZliritDO/
├── asset/                          # Aset visual & identitas brand
│   ├── zliritdo-logo-icon.png      # Ikon aplikasi format raster
│   ├── zliritdo-logo-icon.svg      # Ikon aplikasi vektor tajam
│   ├── zliritdo-wordmark.png       # Wordmark logo raster
│   └── zliritdo-wordmark.svg       # Wordmark logo SVG produksi
├── index.html                      # Markup utama SPA & dialog modal
├── styles.css                      # Design system, variabel CSS, tema dark mode
├── app.js                          # State management, audio synth, timer logic
├── manifest.json                   # Web App Manifest untuk instalasi PWA
└── README.md                       # Dokumentasi resmi proyek
```

---

## 💡 Key Takeaways

1. **Efisiensi Vanilla JS**: Membangun aplikasi produktivitas yang kompleks dengan Vanilla JavaScript melatih pemahaman mendalam tentang siklus event loop, interval timer, dan manajemen state tanpa overhead dependensi eksternal.
2. **Audio Sintetis Web Audio API**: Menggunakan `AudioContext` bawaan browser terbukti jauh lebih reliabel dan ringan dibandingkan memuat file `.mp3` atau `.wav`, terutama pada koneksi seluler lambat.
3. **Desain Berbasis Tujuan (Goal-Oriented UX)**: Mengubah konsep to-do list tradisional dari sekadar daftar item menjadi target waktu terukur secara drastis meningkatkan kejelasan aksi harian pengguna.

---

## 👨‍💻 Pengembang

**M. Dicky Andrean**  
*Full-Stack Web Developer*  
- GitHub: [@DickyAndrean07](https://github.com/DickyAndrean07)  
- Email: [karangsawo123@gmail.com](mailto:karangsawo123@gmail.com)  
- Repositori: [ZliritDO](https://github.com/DickyAndrean07/ZliritDO)

---

<p align="center">
  <sub>Dibuat dengan dedikasi untuk kebersihan kode, keandalan sistem, dan pengalaman pengguna yang bermakna.</sub>
</p>
