# MBG Review & Track Backend

Backend RESTful API untuk aplikasi MBG Review & Track, mendukung monitoring, absensi, review menu makanan, dan laporan darurat di lingkungan sekolah.

## Fitur Utama
- Autentikasi JWT
- Manajemen pengguna (Admin)
- Sinkronisasi absensi (Raspberry Pi)
- Pengelolaan menu katering
- Feedback siswa terhadap menu
- Laporan darurat oleh sekolah
- Dashboard ringkasan data
- Rate limiter & keamanan (Helmet, CORS)
- Logging terpusat (Winston)
- Support SQLite (dev) & PostgreSQL (production)


## Instalasi
1. Clone repo ini.
2. Jalankan `npm install` untuk menginstal semua dependencies.
3. Konfigurasikan file `.env` atau `.env.prod` sesuai kebutuhan. Untuk production, gunakan database PostgreSQL eksternal (misal NeonDB):
   - Isi DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS sesuai detail dari NeonDB.
4. Jalankan server:
   - Development: `npm run dev`
   - Production: `npm start` atau gunakan Docker Compose (tanpa service db).

## Struktur Direktori
- `/src/api` — Semua route API
- `/src/controllers` — Logika bisnis
- `/src/models` — Model Sequelize
- `/src/middlewares` — Middleware (auth, error, validation, dll.)
- `/src/config` — Konfigurasi database, logger
- `/src/validators` — Validasi request

## Dokumentasi API
Lihat file `API_DOCUMENTATION.md` untuk detail endpoint, format request/response, dan otorisasi.

## Kontribusi
Pull request dan issue sangat terbuka untuk pengembangan lebih lanjut.

## Lisensi
MIT
