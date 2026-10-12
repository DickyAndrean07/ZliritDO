# ZliritDo — Production Web Application

> **"Make time for what matters."**  
> Web app pelacak disiplin harian dan sesi fokus berbasis target waktu (*Time-Targeted Daily Discipline & Focus Tracker*). Siap digunakan untuk rutinitas harian, pengembangan diri, dan showcase portofolio profesional.

---

## 🚀 Fitur Utama (Ready to Production)

1. **Dashboard Produksi**:
   - Tampilan bersih tanpa mockup/frame HP tiruan.
   - Layout responsif: 2-kolom di desktop & 1-kolom di smartphone dengan navigasi bawah.
   - Header aplikasi dengan jam/tanggal lokal otomatis (*Indonesian format*), indikator streak disiplin (🔥), dan navigasi tab instan.

2. **Manajemen Target Waktu Harian**:
   - Tentukan batas minimal komitmen waktu per aktivitas (misal: Belajar Coding 2 jam, Olahraga 1 jam).
   - Bilah kemajuan (*progress bar*) dan status capaian 100% (*Target hari ini selesai! ✓*).
   - Tombol langsung **▶ Fokus** pada setiap item aktivitas untuk beralih target dengan 1 klik.
   - Opsi hapus aktivitas kustom.

3. **Active Focus Engine & Timer Presisi**:
   - Timer fokus realtime dengan status live (*"FOCUSING NOW"* dengan efek mint glow).
   - Menghitung sisa waktu komitmen hari ini (*Remaining Today*).
   - Saat sesi diselesaikan, durasi otomatis terakumulasi ke aktivitas dan dicatat ke log riwayat.
   - Efek suara sintetis ramah (*chimes*) saat mulai dan selesai menggunakan Web Audio API tanpa file audio eksternal.

4. **Mode Fokus Layar Penuh (Immersive Focus)**:
   - Tampilan bebas distraksi dengan cincin fokus besar, timer raksasa, dan kontrol fokus terisolasi.

5. **Riwayat & Statistik**:
   - Grafik distribusi waktu yang dihabiskan untuk masing-masing aktivitas.
   - Tabel riwayat sesi lengkap dengan tanggal, durasi, dan catatan.
   - Fitur **🔄 Mulai Hari Baru** untuk mereset progres harian secara aman sekaligus menambah streak disiplin.

6. **Pengaturan & Manajemen Data**:
   - Toggle audio suara aktif/nonaktif.
   - **📥 Backup Data ke JSON**: Ekspor data ke file cadangan lokal kapan saja.
   - **🗑️ Reset Data**: Atur ulang data aplikasi ke pengaturan awal jika diperlukan.
   - Zero-login friction: Semua data langsung tersimpan di `localStorage` peramban.

---

## 🎨 Design System
- **Palet Utama**: Midnight Navy (`#07182c`), Deep Blue (`#0b2c4b`), Mint Glow (`#62edbd`)
- **Aksen Visual**: Frosted Glassmorphism, Conic-gradient Circular Rings, Micro-animations
- **Tipografi**: Inter (Google Fonts)

---

## 📂 Struktur File
- [index.html](file:///c:/2026/to%20do%20list/index.html) — Kerangka semantik HTML5 aplikasi produksi, dashboard, mode fokus, riwayat, dan modal dialog.
- [styles.css](file:///c:/2026/to%20do%20list/styles.css) — CSS murni dengan variabel tema, layout grid responsif, dan styling glassmorphism.
- [app.js](file:///c:/2026/to%20do%20list/app.js) — Logika state store, timer interval, audio sintetis, navigasi SPA, dan LocalStorage.

---

## 💻 Cara Menjalankan
1. Buka file **[index.html](file:///c:/2026/to%20do%20list/index.html)** langsung di browser (Chrome, Edge, Safari, Firefox).
2. Siap dideploy ke **GitHub Pages**, **Vercel**, atau **Netlify** cukup dengan mengunggah folder ini.
