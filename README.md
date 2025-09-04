# MBG Backend (FastAPI)

Versi FastAPI dari proyek MBG Backend. Tujuan: migrasi endpoint dan fitur utama dari Express ke FastAPI dengan parity.

## Setup & Install

```powershell
# Aktifkan venv
.\.venv\Scripts\Activate.ps1
# Install dependencies
pip install -r requirements.txt
# Copy dan edit .env
cp .env.example .env
# Jalankan server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Endpoint Utama
- `/auth` (register, login, me)
- `/users` (CRUD, masteradmin)
- `/attendance/sync`
- `/catering` (CRUD, me)
- `/feedback` (menu/today, submit, me)
- `/emergency-report` (CRUD, me)
- `/reports` (summary, emergency)
- `/dashboard` (school, catering, admin)

## Dokumentasi API
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Redoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Middleware & Security
- JWT, role-based, API key
- Security headers (Helmet parity)
- CORS whitelist (env: `CORS_WHITELIST`)
- Rate limiter (SlowAPI, login)
- Error handler terpusat

## Parity dengan Express
- Semua endpoint utama sudah migrasi
- Catatan: endpoint `/users/masteradmin` dan `/feedback/menu/today` perlu dicek/ditambah jika belum

## Testing
```powershell
pytest --maxfail=5 --disable-warnings -v
```

## Contoh Request
### Register
```json
POST /auth/register
{
  "namaLengkap": "User",
  "email": "user@example.com",
  "password": "password123",
  "role": "SISWA"
}
```
### Login
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```
### Response Error
```json
{
  "message": "Invalid credentials"
}
```

## Konfigurasi Environment
Lihat dan edit `.env.example` sesuai kebutuhan (CORS, DB, JWT, dsb).
