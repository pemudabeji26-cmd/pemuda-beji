# MANAGEMENT TABUNGAN PEMUDA BEJI

Aplikasi web modern, cepat, dan profesional untuk mengelola kas serta tabungan anggota **Pemuda Beji**. Menggunakan frontend **React + TypeScript + Tailwind CSS** yang siap di-deploy ke **Vercel**, dengan **Google Sheets** sebagai database gratis dan **Google Apps Script** sebagai REST API backend.

---

## 1. Ringkasan & Fitur Utama

- **Role Berjenjang**:
  - **ADMIN**: Akses penuh (Dashboard, data anggota, tambah/edit/nonaktifkan anggota, reset password, seluruh mutasi transaksi, laporan kas, cetak kartu anggota, pengaturan sistem).
  - **BENDAHARA**: Pengelola operasional kas (Dashboard finansial, input setoran & penarikan, riwayat transaksi, rekapitulasi laporan, cetak kartu anggota).
  - **ANGGOTA**: Akses mandiri (Dashboard pribadi, saldo tabungan realtime, riwayat transaksi pribadi, kartu anggota digital, QR Code verifikasi publik, ganti profil & password).
- **Perhitungan Saldo Otomatis**: Rumus konsisten `SALDO = TOTAL SETOR - TOTAL TARIK` dengan validasi saldo sebelum/sesudah dan pencegahan saldo negatif saat penarikan.
- **Konfirmasi Penarikan**: Modal konfirmasi nominal sebelum pemotongan saldo.
- **Kartu Anggota Digital**: Desain rasio ID Card profesional bernuansa Navy & Putih (`#082B66`), dilengkapi QR Code verifikasi yang dapat dicetak atau diunduh sebagai gambar PNG.
- **Halaman Verifikasi QR Publik**: Rute `/verify/:id` untuk memeriksa keaslian keanggotaan tanpa mengekspos data sensitif (password, saldo, nomor HP, dan alamat dirahasiakan).
- **Format Rupiah & Tanggal Indonesia**: Menggunakan format `Rp 1.250.000` dan penanggalan berbahasa Indonesia (`28 September 2026`).
- **Export Data**: Fitur unduh riwayat transaksi dan buku kas dalam format CSV serta mode cetak laporan formal.

---

## 2. Identitas Visual & Warna

- **Navy Blue (Utama)**: `#082B66`
- **Dark Navy (Aksen/Sidebar)**: `#061B3A`
- **Secondary Blue**: `#123C82`
- **Background**: `#F5F7FA`
- **Surface & Cards**: `#FFFFFF`
- **Border**: `#E2E8F0`

---

## 3. Akun Uji Coba (Testing Accounts)

Aplikasi telah dilengkapi tombol **Uji Coba Cepat (Quick Fill)** di halaman login:

| Role | Username / No. Anggota | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin123` | Akses penuh seluruh sistem |
| **BENDAHARA** | `bendahara` | `bendahara123` | Input setoran & penarikan |
| **ANGGOTA** | `PB-001` | `anggota123` | Dashboard & Kartu Ahmad Fauzi |
| **ANGGOTA** | `PB-002` | `anggota123` | Dashboard & Kartu Budi Santoso |

*Catatan: Segera ganti password default setelah login pertama kali pada menu Profil Akun.*

---

## 4. Struktur Direktori Project

```
├── .env.example                # Format konfigurasi variabel lingkungan
├── index.html                  # Entry point HTML & font Plus Jakarta Sans
├── metadata.json               # Metadata aplikasi
├── package.json                # Dependencies & scripts Vite
├── README.md                   # Dokumentasi panduan lengkap
├── vite.config.ts              # Konfigurasi bundler Vite
├── google-apps-script/
│   └── Code.gs                 # Kode backend lengkap untuk Google Apps Script
└── src/
    ├── assets/
    │   ├── images/             # Logo resmi Pemuda Beji & foto profil
    │   └── logo.ts             # Export referensi aset visual
    ├── components/
    │   ├── card/
    │   │   └── MemberIdCard.tsx # Komponen Kartu Anggota Digital & QR
    │   └── common/
    │       ├── ConfirmationModal.tsx # Dialog konfirmasi penarikan
    │       ├── Header.tsx      # Header top bar responsive
    │       ├── Sidebar.tsx     # Navigasi sidebar sesuai role
    │       └── Toast.tsx       # Sistem notifikasi toast
    ├── context/
    │   └── AuthContext.tsx     # Autentikasi dan state sesi login
    ├── pages/
    │   ├── Dashboard.tsx       # Dashboard dinamis (Admin/Bendahara/Anggota)
    │   ├── Login.tsx           # Halaman login modern split layout
    │   ├── MemberCardPage.tsx  # Halaman pratinjau & cetak kartu anggota
    │   ├── Members.tsx         # Manajemen data anggota
    │   ├── Profile.tsx         # Profil akun & ganti kata sandi
    │   ├── Reports.tsx         # Laporan keuangan kas & filter
    │   ├── Settings.tsx        # Pengaturan & status Google Apps Script
    │   ├── Transactions.tsx    # Input setoran/penarikan & riwayat
    │   └── VerifyMember.tsx    # Halaman publik verifikasi scan QR
    ├── services/
    │   └── api.ts              # API client Google Apps Script & offline fallback
    ├── types/
    │   └── index.ts            # Definisi TypeScript interface & types
    ├── utils/
    │   └── formatters.ts       # Format Rupiah, Tanggal Indo, & Export CSV
    ├── App.tsx                 # Router utama & protected view logic
    └── index.css               # Styling Tailwind CSS v4 & Print styles
```

---

## 5. Struktur Database Google Sheets (4 Sheet)

Buat satu Google Spreadsheet baru, kemudian siapkan **4 Tab Sheet** dengan nama dan header kolom huruf kecil tepat berikut:

### Sheet 1: `ANGGOTA`
Header kolom baris 1:
```
id | nomor_anggota | nama | username | password_hash | hp | alamat | foto | tanggal_gabung | status | created_at | updated_at
```

### Sheet 2: `TRANSAKSI`
Header kolom baris 1:
```
id_transaksi | tanggal | nomor_anggota | nama | jenis | nominal | saldo_sebelum | saldo_sesudah | keterangan | created_by | created_at
```

### Sheet 3: `USER`
Header kolom baris 1:
```
id | username | password_hash | role | nomor_anggota | status | created_at | last_login
```

### Sheet 4: `PENGATURAN`
Header kolom baris 1:
```
key | value
```
Contoh isi baris:
- `nama_aplikasi` | `Management Tabungan Pemuda Beji`
- `nama_organisasi` | `Pemuda Beji`
- `warna_primary` | `#082B66`
- `warna_secondary` | `#123C82`
- `warna_background` | `#F5F7FA`

---

## 6. Panduan Setup Google Apps Script

1. Buka Google Spreadsheet yang telah Anda buat.
2. Klik menu **Extensions** (Ekstensi) > **Apps Script**.
3. Hapus kode bawaan di `Code.gs`.
4. Salin seluruh isi file `google-apps-script/Code.gs` dari project ini, lalu tempelkan.
5. Pada baris atas `Code.gs`:
   ```javascript
   const SPREADSHEET_ID = 'ISI_ID_GOOGLE_SHEET';
   ```
   Ganti `'ISI_ID_GOOGLE_SHEET'` dengan ID Spreadsheet Anda (dapat diambil dari URL Spreadsheet di antara `/d/` dan `/edit`). Jika skrip dibuat langsung di dalam sheet tersebut (*container-bound*), Anda juga bisa membiarkannya atau memasukkan ID spreadsheet.
6. Simpan project (ikon Disket / `Ctrl + S`).
7. **Jalankan Inisialisasi Otomatis (Opsional)**:
   Pilih fungsi `initDatabase` pada dropdown fungsi, lalu klik **Run**. Berikan izin akses (*Review Permissions*) jika diminta. Skrip akan membuatkan header sheet dan akun default secara otomatis.
8. Klik tombol **Deploy** (Terapkan) di pojok kanan atas > **New deployment** (Penerapan baru).
9. Pilih jenis: **Web app** (Aplikasi web).
10. Konfigurasi:
    - **Description**: `Tabungan Pemuda Beji API`
    - **Execute as**: `Me (email Anda)`
    - **Who has access**: `Anyone` (Siapa saja — **PENTING** agar frontend dapat mengakses data tanpa kendala izin).
11. Klik **Deploy**.
12. Salin **Web App URL** yang dihasilkan (berakhiran `/exec`).

---

## 7. Panduan Deploy ke Vercel

1. Unggah kode project ini ke repository GitHub Anda.
2. Buka dashboard [Vercel](https://vercel.com) dan klik **Add New** > **Project**.
3. Pilih repository GitHub project ini dan klik **Import**.
4. Pada bagian **Environment Variables**, tambahkan:
   - **Key**: `VITE_API_URL`
   - **Value**: Masukkan URL Web App Google Apps Script dari langkah sebelumnya (contoh: `https://script.google.com/macros/s/AKfycb.../exec`).
5. Klik tombol **Deploy**.
6. Vercel akan otomatis menjalankan `npm run build` dan mempublikasikan aplikasi web Anda dalam waktu kurang dari 1 menit.

---

## 8. Mode Dual: Standby Lokal & Live Google Sheets

Aplikasi ini dirancang dengan arsitektur tangguh:
- Jika `VITE_API_URL` belum diisi atau server Google Apps Script sedang diperbarui, aplikasi secara otomatis menggunakan database lokal di browser (Local Storage) dengan data seed lengkap sehingga seluruh alur (login, setor, tarik, cetak kartu, scan verifikasi) dapat langsung diuji coba 100%.
- Jika `VITE_API_URL` telah diisi, aplikasi akan melakukan transaksi langsung ke Google Sheets secara realtime. Anda dapat memeriksa status koneksi kapan saja melalui menu **Pengaturan** > **Uji Koneksi**.

---

## 9. Troubleshooting & FAQ

1. **Muncul pesan "Server sedang tidak dapat dihubungi" saat request ke Apps Script?**
   - Pastikan pada saat deploy Apps Script, opsi **Who has access** dipilih **Anyone** (bukan "Only myself").
   - Jika Anda mengubah kode di `Code.gs`, pastikan Anda membuat **New deployment** (atau mengupdate versi deployment) agar perubahan aktif pada URL Web App.
2. **Kenapa saldo anggota tidak bertambah setelah setoran?**
   - Pastikan jenis transaksi adalah `SETOR` (huruf kapital) dan nominal bernilai positif.
3. **Mengapa penarikan ditolak?**
   - Sistem memvalidasi agar penarikan tidak pernah melebihi saldo tabungan berjalan (`nominal <= saldoSebelum`).
4. **Apakah scan QR Code mengekspos data pribadi anggota?**
   - Tidak. QR Code hanya memuat tautan menuju halaman verifikasi publik yang hanya menampilkan nama, nomor anggota, tanggal bergabung, dan status aktif. Saldo, nomor HP, dan alamat sengaja disembunyikan.

---

© 2026 Organisasi Pemuda Beji. Hak Cipta Dilindungi.
