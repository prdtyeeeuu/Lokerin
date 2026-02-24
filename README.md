# Lokerin - Platform Lamaran Kerja

Platform modular untuk mengelola lamaran kerja dan proses rekrutmen.

## Instalasi

1. Pastikan Anda memiliki Node.js dan MySQL terinstal di sistem Anda.

2. Clone atau download repositori ini:
   ```bash
   git clone <repository-url>
   cd lokerin
   ```

3. Instal dependensi:
   ```bash
   npm install
   ```

4. Konfigurasi database:
   - Buat database MySQL baru
   - Eksekusi file `init_db.sql` untuk membuat tabel dan data awal
   - Ubah konfigurasi koneksi database di `server.js` sesuai dengan pengaturan Anda:
     ```javascript
     const db = mysql.createConnection({
       host: 'localhost',
       user: 'root', // Ganti dengan username MySQL Anda
       password: '', // Ganti dengan password MySQL Anda
       database: 'lokerin_db'
     });
     ```

## Menjalankan Aplikasi

### Backend (Server)
1. Jalankan server:
   ```bash
   npm start
   ```
   Server akan berjalan di `http://localhost:5000`

### Frontend (Client)
1. Buka file `index.html` di browser Anda secara langsung atau gunakan server statis seperti:
   ```bash
   npx serve .
   ```
   
## Fitur

- Registrasi dan login pengguna
- Profil lengkap dengan upload foto
- Sistem pencarian kandidat
- Portofolio dan bukti kerja
- Sistem permintaan akses profil
- Antarmuka yang responsif

## Teknologi yang Digunakan

- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Node.js, Express.js
- Database: MySQL
- UI Framework: Tailwind CSS (melalui CDN)
- Ikon: Font Awesome

## Struktur Proyek

```
├── index.html          # Halaman utama
├── css/
│   └── style.css       # File CSS kustom
├── js/
│   ├── api.js          # Fungsi API untuk komunikasi dengan backend
│   ├── database.js     # Fungsi untuk manajemen data
│   ├── auth.js         # Fungsi otentikasi
│   ├── ui.js           # Fungsi antarmuka pengguna
│   └── app.js          # Fungsi utama aplikasi
├── server.js           # File server Node.js
├── db_config.js        # Konfigurasi koneksi database
├── init_db.sql         # Skema database
└── package.json        # Dependensi proyek
```

## Kontribusi

Kontribusi sangat diterima. Silakan buat pull request untuk perbaikan atau penambahan fitur.