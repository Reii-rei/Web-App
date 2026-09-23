# Absensi Karyawan

Web app absensi karyawan dengan foto, lokasi, dan penyimpanan otomatis ke Google Sheets. Bisa di-hosting gratis lewat GitHub Pages dan dipasangi domain sendiri.

## Isi proyek

| File | Fungsi |
|---|---|
| `index.html` | Halaman absen untuk karyawan (kamera, jam, form) |
| `admin.html` | Dashboard admin (login, edit jam, hapus, ekspor CSV) |
| `Code.gs` | Backend Google Apps Script (nyambung ke Google Sheets + Drive) |

## Fitur

- Absen dengan foto langsung dari kamera depan/belakang (HP maupun laptop)
- Absen masuk / pulang dengan satu ketukan
- Data lokasi (opsional, dari GPS browser) disimpan tiap absen
- Otomatis tersimpan ke Google Sheets — tidak perlu database sendiri
- Foto tersimpan rapi di folder Google Drive, tertaut di sheet
- Dashboard admin: cari, filter tanggal/jenis, ubah jam absen, hapus data, ekspor CSV
- Statistik ringkas (jumlah absen hari ini, masuk/pulang)
- Mengingat nama karyawan di perangkat masing-masing (tak perlu ketik ulang tiap hari)
- Tampilan responsif — otomatis menyesuaikan di HP maupun layar laptop
- Mendukung mode gelap otomatis mengikuti sistem
- Tanpa instalasi aplikasi tambahan, cukup dibuka lewat browser

## 1. Siapkan Google Sheets + Apps Script

1. Buka [sheets.google.com](https://sheets.google.com), buat spreadsheet baru, beri nama misalnya **Absensi Karyawan**.
2. Buka menu **Extensions → Apps Script**.
3. Hapus kode contoh yang ada, lalu salin-tempel seluruh isi `Code.gs` dari proyek ini.
4. Di sisi kiri Apps Script, klik ikon **⚙️ Project Settings** → scroll ke **Script Properties** → **Add script property**:
   - Property: `ADMIN_PASSWORD`
   - Value: kata sandi admin pilihanmu (contoh: `admin123`)
5. Kembali ke editor, klik **Deploy → New deployment**.
   - Pilih tipe: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Klik **Deploy**, izinkan akses saat diminta (Google akan menampilkan peringatan "app belum diverifikasi" — klik **Advanced → Buka [nama project] (unsafe)**, ini normal karena skrip milikmu sendiri).
7. Salin **Web app URL** yang muncul — bentuknya seperti:
   `https://script.google.com/macros/s/XXXXXXXXXXXX/exec`

> Setiap kali kamu mengedit `Code.gs`, gunakan **Deploy → Manage deployments → Edit (ikon pensil) → New version** agar URL yang sama ikut ter-update.

## 2. Hubungkan halaman web ke Apps Script

Buka `index.html` dan `admin.html`, cari baris:

```js
const API_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_DI_SINI";
```

Ganti dengan URL Web App dari langkah sebelumnya, di **kedua file**.

## 3. Coba secara lokal (opsional)

Buka `index.html` langsung di browser untuk uji coba. Untuk kamera bekerja penuh di HP, situs perlu diakses lewat **HTTPS** (GitHub Pages otomatis menyediakan ini) — membuka file secara lokal (`file://`) biasanya masih bisa untuk kamera depan/belakang di sebagian besar browser, tapi disarankan langsung uji di GitHub Pages.

## 4. Unggah ke GitHub

1. Buat repository baru di GitHub, misalnya `absensi-karyawan`.
2. Unggah tiga file (`index.html`, `admin.html`, `Code.gs` boleh disertakan sebagai dokumentasi) ke repository tersebut.
   - Lewat web: klik **Add file → Upload files**, seret ketiga file, lalu **Commit**.
   - Lewat terminal:
     ```bash
     git init
     git add .
     git commit -m "Absensi karyawan v1"
     git branch -M main
     git remote add origin https://github.com/USERNAME/absensi-karyawan.git
     git push -u origin main
     ```

## 5. Aktifkan GitHub Pages

1. Di repository, buka **Settings → Pages**.
2. Pada **Source**, pilih branch `main` dan folder `/ (root)`.
3. Klik **Save**. Setelah beberapa menit, situs akan aktif di:
   `https://USERNAME.github.io/absensi-karyawan/`
4. Halaman admin dapat diakses di:
   `https://USERNAME.github.io/absensi-karyawan/admin.html`

## 6. Pasang custom domain (opsional)

1. Di **Settings → Pages → Custom domain**, masukkan domainmu (contoh: `absensi.perusahaanku.com`) lalu simpan. GitHub akan membuat file `CNAME` otomatis di repository.
2. Di panel DNS penyedia domainmu, tambahkan salah satu:
   - **Subdomain** (misal `absensi.perusahaanku.com`): buat record **CNAME** mengarah ke `USERNAME.github.io`
   - **Domain utama** (misal `perusahaanku.com`): buat 4 record **A** mengarah ke:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
3. Tunggu propagasi DNS (bisa beberapa menit sampai beberapa jam), lalu di **Settings → Pages** centang **Enforce HTTPS**.

## Catatan keamanan & keterbatasan

- Login admin memakai satu kata sandi bersama (disimpan di Script Properties, tidak pernah muncul di kode publik). Cukup untuk tim kecil; untuk perusahaan besar, pertimbangkan menambah verifikasi Google Login lewat Apps Script.
- Foto tersimpan di Google Drive akun pemilik spreadsheet dengan akses "siapa saja yang punya tautan dapat melihat" — tautan hanya diketahui lewat sheet, tidak diindeks publik, namun jangan bagikan tautan foto ke luar.
- Google Apps Script Web App gratis punya batas kuota harian (cukup untuk ratusan absen/hari); untuk skala sangat besar pertimbangkan backend khusus.
- Lokasi GPS bersifat opsional dan hanya terekam jika karyawan mengizinkan akses lokasi di browser.

## Kustomisasi cepat

- **Warna & tampilan**: ubah variabel di bagian `:root{...}` pada `<style>` di `index.html`/`admin.html`.
- **Nama perusahaan**: ganti teks "ABSENSI KARYAWAN" di `index.html`.
- **Jam kerja / validasi keterlambatan**: bisa ditambahkan di `Code.gs` pada fungsi `handleCheckin` (bandingkan jam dengan jam masuk standar, lalu tandai status "Telat").
