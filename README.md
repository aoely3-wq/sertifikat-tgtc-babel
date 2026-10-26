# Aplikasi e-Sertifikat Kuliah Umum Treasury Goes To Campus (TGTC)
### Kantor Wilayah Direktorat Jenderal Perbendaharaan Provinsi Kepulauan Bangka Belitung

Aplikasi web modern untuk pencetakan dan pendistribusian sertifikat digital secara otomatis kepada peserta kegiatan **Kuliah Umum Treasury Goes To Campus (TGTC)** yang diselenggarakan oleh Kanwil Ditjen Perbendaharaan Provinsi Kepulauan Bangka Belitung.

---

## 🚀 Fitur Utama

1. **Formulir Mandiri Peserta (`/`)**:
   - Input Nama Lengkap (yang akan dicetak di sertifikat), Email Aktif, Nomor WhatsApp Aktif, dan Asal Kampus/Instansi.
   - **Live Real-time Certificate Preview**: Tampilan sertifikat diperbarui seketika secara proporsional sesuai nama yang diketik oleh peserta.
   - Fitur pencarian / unduh ulang bagi peserta yang sudah pernah mendaftar.

2. **Mesin Generator PDF Otomatis (High-Resolution Vector PDF)**:
   - Mencetak Nama Lengkap, Nomor Sertifikat unik (`TGTC-BABEL/2026/X/...`), Tanggal Kegiatan, dan **QR Code Keabsahan Digital**.
   - Bekerja secara otomatis menggunakan template resmi bawaan Kemenkeu/DJPb Babel, ataupun template gambar kustom dari panitia.

3. **Mekanisme Pengiriman Terintegrasi**:
   - **Download Langsung**: Unduh instan file PDF sertifikat setelah formulir disubmit.
   - **Kirim Otomatis ke Email**: File PDF sertifikat dilampirkan langsung via email peserta (didukung SMTP Gmail dan mode simulasi lokal).
   - **Kirim ke WhatsApp**: Tombol instan langsung membuka percakapan WhatsApp dengan pesan terima kasih resmi dan tautan unduh dokumen.

4. **Verifikasi Keabsahan Dokumen via QR Code (`/verify/[id]`)**:
   - Setiap lembar sertifikat memiliki QR Code unik.
   - Jika dipindai menggunakan kamera smartphone, akan membuka halaman verifikasi resmi Kanwil DJPb Babel untuk memvalidasi keaslian dokumen.

5. **Dashboard Koordinator / Admin (`/admin`)**:
   - Ringkasan statistik peserta, total pengiriman email, dan total unduhan.
   - Tabel manajemen seluruh peserta (kirim ulang email, buka WhatsApp, unduh PDF, atau hapus).
   - Ekspor seluruh data peserta ke format Excel / CSV.
   - Pengaturan template (posisi koordinat nama Y, ukuran font nama, warna teks).
   - Konfigurasi kredensial SMTP Email pengirim.

---

## 💻 Cara Menjalankan Aplikasi

Buka Terminal (PowerShell / Command Prompt) dan jalankan:

```powershell
cd C:\Users\drrac\sertifikat-tgtc-babel
npm run dev
```

Buka browser di:
- 👉 **[http://localhost:3000](http://localhost:3000)** (Halaman Peserta & Klaim Sertifikat)
- 👉 **[http://localhost:3000/admin](http://localhost:3000/admin)** (Dashboard Panitia / Admin)

---

## 🎨 Panduan Memasang Template Sertifikat Sendiri

Jika panitia telah memiliki desain sertifikat tanpa nama (format PNG atau JPG Landscape A4):
1. Beri nama file gambar tersebut: `certificate-template.png`
2. Letakkan file tersebut di dalam folder:
   ```
   C:\Users\drrac\sertifikat-tgtc-babel\public\templates\certificate-template.png
   ```
3. Buka halaman **Admin > Pengaturan Template** ([http://localhost:3000/admin](http://localhost:3000/admin)) untuk menyesuaikan posisi vertikal nama (Y%), ukuran font, dan warna teks agar pas dengan desain Anda.

---

## ✉️ Panduan Konfigurasi Email (SMTP)

Untuk mengirimkan file PDF langsung ke email peserta menggunakan Gmail:
1. Aktifkan **2-Step Verification** pada akun Google panitia.
2. Buka menu **Keamanan Akun Google > Sandi Aplikasi (App Passwords)**.
3. Buat password aplikasi baru dan salin 16 karakter tersebut.
4. Buka menu **Admin > Konfigurasi SMTP Email** ([http://localhost:3000/admin](http://localhost:3000/admin)) dan masukkan:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `465`
   - **SMTP User**: Alamat Gmail pengirim
   - **SMTP Password**: 16 karakter App Password tadi
5. Klik **Simpan Kredensial SMTP**.
*(Catatan: Jika belum diisi, sistem tetap berjalan normal dalam mode simulasi)*.
