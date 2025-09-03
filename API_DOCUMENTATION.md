
# Dokumentasi API - MBG Review & Track

## Daftar Isi

- [Pendahuluan](#pendahuluan)
- [Informasi Umum](#informasi-umum)
  - [Base URL](#base-url)
  - [Autentikasi](#autentikasi)
  - [Format Respons](#format-respons)
  - [Kode Status Umum](#kode-status-umum)
- [Endpoints API](#endpoints-api)
  - [Authentication](#authentication)
    - [Register Pengguna](#register-pengguna)
    - [Login Pengguna](#login-pengguna)
    - [Get Profile](#get-profile)
  - [Users (Admin)](#users-admin)
    - [Get All Users](#get-all-users)
    - [Create User](#create-user)
    - [Get User by ID](#get-user-by-id)
    - [Update User](#update-user)
    - [Delete User](#delete-user)
  - [Attendance (Sinkronisasi Raspberry Pi)](#attendance-sinkronisasi-raspberry-pi)
    - [Sync Attendance](#sync-attendance)
  - [Catering](#catering)
    - [Create Catering Log](#create-catering-log)
    - [Get Catering Logs by Caterer](#get-catering-logs-by-caterer)
  - [Feedback (Siswa)](#feedback-siswa)
    - [Get Today's Menu](#get-todays-menu)
    - [Submit Feedback](#submit-feedback)
    - [Get My Feedback History](#get-my-feedback-history)
  - [Emergency Reports](#emergency-reports)
    - [Create Emergency Report (Sekolah)](#create-emergency-report-sekolah)
    - [Get Emergency Reports by My School](#get-emergency-reports-by-my-school)
    - [Get All Emergency Reports (Admin & Dinkes)](#get-all-emergency-reports-admin--dinkes)
    - [Update Emergency Report Status (Admin & Dinkes)](#update-emergency-report-status-admin--dinkes)
  - [Dashboard](#dashboard)
    - [Get School Dashboard Summary](#get-school-dashboard-summary)
    - [Get Catering Dashboard Summary](#get-catering-dashboard-summary)
    - [Get Admin Dashboard Summary](#get-admin-dashboard-summary)

## Pendahuluan
API MBG Review & Track adalah backend RESTful yang dirancang untuk mendukung aplikasi monitoring, absensi, dan review menu makanan di lingkungan sekolah. API ini menyediakan fitur autentikasi, manajemen pengguna, sinkronisasi data absensi, pengelolaan menu katering, feedback siswa, laporan darurat, dan dashboard ringkasan data. Semua endpoint menggunakan format JSON dan JWT untuk otentikasi.

## Informasi Umum

### Base URL
- Development: `http://localhost:3000/v1`
- Production: `https://api.mbg-app.com/v1`

### Autentikasi
- API menggunakan JWT (JSON Web Token).
- Token dikirim di header:
  - `Authorization: Bearer <JWT_TOKEN>`

### Format Respons
- Sukses: Status 2xx, data dalam format JSON.
- Error: Status 4xx/5xx, respons:
  ```json
  {
    "error": "Pesan error yang deskriptif"
  }
  ```

### Kode Status Umum
| Kode | Arti |
|------|------|
| 200  | OK (Permintaan berhasil) |
| 201  | Created (Data berhasil dibuat) |
| 400  | Bad Request (Permintaan tidak valid) |
| 401  | Unauthorized (Token tidak valid/expired) |
| 403  | Forbidden (Akses ditolak) |
| 404  | Not Found (Resource tidak ditemukan) |
| 422  | Unprocessable Entity (Validasi gagal) |
| 500  | Internal Server Error (Kesalahan server) |

---

## Endpoints API

### Authentication

#### Register Pengguna
Endpoint: **POST /auth/register**
Deskripsi: Registrasi akun baru.
Otorisasi: Public

Request:
- Headers:
  - Content-Type: application/json
- Body:
  ```json
  {
    "namaLengkap": "string (wajib)",
    "email": "string (wajib)",
    "password": "string (wajib, min 8 karakter)",
    "role": "string (wajib, salah satu: ADMIN, SISWA, SEKOLAH, KATERING, DINKES)",
    "nfcTagId": "string (opsional)",
    "schoolId": "integer (opsional, untuk role SISWA)"
  }
  ```

Response:
- 201 Created:
  ```json
  {
    "token": "string (JWT)",
    "user": {
      "id": "integer",
      "namaLengkap": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- 400 Bad Request:
  ```json
  { "error": "Email sudah terdaftar." }
  ```
- 422 Unprocessable Entity:
  ```json
  { "errors": [ { "msg": "Email tidak valid." } ] }
  ```

---

#### Login Pengguna
Endpoint: **POST /auth/login**
Deskripsi: Login dan mendapatkan token JWT.
Otorisasi: Public

Request:
- Headers:
  - Content-Type: application/json
- Body:
  ```json
  {
    "email": "string (wajib)",
    "password": "string (wajib)"
  }
  ```

Response:
- 200 OK:
  ```json
  {
    "token": "string (JWT)",
    "user": {
      "id": "integer",
      "namaLengkap": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- 401 Unauthorized:
  ```json
  { "error": "Email atau password salah." }
  ```
- 422 Unprocessable Entity:
  ```json
  { "errors": [ { "msg": "Email wajib diisi." } ] }
  ```

---

#### Get Profile
Endpoint: **GET /auth/me**
Deskripsi: Mendapatkan data profil pengguna yang sedang login.
Otorisasi: Token (Semua role)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  {
    "user": {
      "id": "integer",
      "namaLengkap": "string",
      "email": "string",
      "role": "string",
      "nfcTagId": "string"
    }
  }
  ```
- 401 Unauthorized:
  ```json
  { "error": "Token tidak valid." }
  ```

---

### Users (Admin)

#### Get All Users
Endpoint: **GET /users**
Deskripsi: Mendapatkan daftar semua pengguna (dengan paginasi).
Otorisasi: Token (**Role: ADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Query Parameters:
  - page (integer, opsional, default: 1)
  - limit (integer, opsional, default: 10)

Response:
- 200 OK:
  ```json
  {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "users": [ { ...user } ]
  }
  ```
- 401 Unauthorized / 403 Forbidden

---

#### Create User
Endpoint: **POST /users**
Deskripsi: Membuat pengguna baru.
Otorisasi: Token (**Role: ADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "namaLengkap": "string (wajib)",
    "email": "string (wajib)",
    "password": "string (wajib)",
    "role": "string (wajib)",
    "nfcTagId": "string (opsional)",
    "schoolId": "integer (opsional)"
  }
  ```

Response:
- 201 Created:
  ```json
  { "user": { ...user } }
  ```
- 400 / 422 / 401 / 403

---

#### Get User by ID
Endpoint: **GET /users/:id**
Deskripsi: Mendapatkan detail satu pengguna.
Otorisasi: Token (**Role: ADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path Parameters:
  - id (integer)

Response:
- 200 OK:
  ```json
  { "user": { ...user } }
  ```
- 404 Not Found

---

#### Update User
Endpoint: **PUT /users/:id**
Deskripsi: Memperbarui data pengguna.
Otorisasi: Token (**Role: ADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path Parameters:
  - id (integer)
- Body:
  ```json
  {
    "namaLengkap": "string (opsional)",
    "email": "string (opsional)",
    "password": "string (opsional)",
    "role": "string (opsional)",
    "nfcTagId": "string (opsional)",
    "schoolId": "integer (opsional)"
  }
  ```

Response:
- 200 OK:
  ```json
  { "user": { ...user } }
  ```
- 404 Not Found

---

#### Delete User
Endpoint: **DELETE /users/:id**
Deskripsi: Menghapus pengguna.
Otorisasi: Token (**Role: ADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path Parameters:
  - id (integer)

Response:
- 200 OK:
  ```json
  { "message": "User deleted." }
  ```
- 404 Not Found

---

### Attendance (Sinkronisasi Raspberry Pi)

#### Sync Attendance
Endpoint: **POST /attendance/sync**
Deskripsi: Sinkronisasi data absensi dari perangkat Raspberry Pi ke server.
Otorisasi: Header API Key (X-API-KEY, didapat dari sekolah)

Request:
- Headers:
  - Content-Type: application/json
  - X-API-KEY: string (wajib)
- Body:
  ```json
  {
    "logs": [
      {
        "nfcTagId": "string (wajib)",
        "timestamp": "string (ISO 8601, wajib)"
      }
    ]
  }
  ```

Response:
- 201 Created:
  ```json
  { "message": "Attendance logs synced successfully.", "count": 10 }
  ```
- 403 Forbidden (API Key salah)
- 404 Not Found (Tidak ada log valid)

---

### Catering

#### Create Catering Log
Endpoint: **POST /catering**
Deskripsi: Katering mengunggah log menu harian.
Otorisasi: Token (**Role: KATERING**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "schoolId": "integer (wajib)",
    "tanggal": "string (YYYY-MM-DD, wajib)",
    "deskripsiMenu": "string (wajib)",
    "fotoMenuUrl": "string (wajib)",
    "catatan": "string (opsional)"
  }
  ```

Response:
- 201 Created:
  ```json
  { "log": { ...cateringLog } }
  ```
- 401 / 403 / 422

---

#### Get Catering Logs by Caterer
Endpoint: **GET /catering/me**
Deskripsi: Melihat log menu harian yang diunggah oleh katering yang sedang login.
Otorisasi: Token (**Role: KATERING**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Query Parameters:
  - page (integer, opsional, default: 1)
  - limit (integer, opsional, default: 10)

Response:
- 200 OK:
  ```json
  {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "logs": [ { ...cateringLog } ]
  }
  ```

---

### Feedback (Siswa)

#### Get Today's Menu
Endpoint: **GET /feedback/menu/today**
Deskripsi: Mendapatkan menu katering hari ini untuk sekolah siswa yang sedang login.
Otorisasi: Token (**Role: SISWA**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  { "menu": { ...cateringLog } }
  ```
- 404 Not Found (Menu belum tersedia)

---

#### Submit Feedback
Endpoint: **POST /feedback**
Deskripsi: Siswa memberikan feedback pada menu katering hari ini.
Otorisasi: Token (**Role: SISWA**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "cateringLogId": "integer (wajib)",
    "rating": "integer (wajib, 1-5)",
    "komentar": "string (opsional)"
  }
  ```

Response:
- 201 Created:
  ```json
  { "feedback": { ...feedback } }
  ```
- 401 / 403 / 422

---

#### Get My Feedback History
Endpoint: **GET /feedback/me**
Deskripsi: Melihat riwayat feedback yang pernah dikirim oleh siswa.
Otorisasi: Token (**Role: SISWA**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  { "feedbacks": [ { ...feedback, cateringLog: { ...cateringLog } } ] }
  ```

---

### Emergency Reports

#### Create Emergency Report (Sekolah)
Endpoint: **POST /reports/emergency**
Deskripsi: Sekolah mengirim laporan darurat (misal, dugaan keracunan).
Otorisasi: Token (**Role: SEKOLAH**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "deskripsi": "string (wajib)"
  }
  ```

Response:
- 201 Created:
  ```json
  { "report": { ...emergencyReport } }
  ```
- 401 / 403 / 422

---

#### Get Emergency Reports by My School
Endpoint: **GET /reports/emergency/me**
Deskripsi: Melihat riwayat laporan darurat yang dikirim oleh sekolah.
Otorisasi: Token (**Role: SEKOLAH**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  { "reports": [ { ...emergencyReport } ] }
  ```

---

#### Get All Emergency Reports (Admin & Dinkes)
Endpoint: **GET /reports/emergency**
Deskripsi: Melihat semua laporan darurat dari seluruh sekolah.
Otorisasi: Token (**Role: ADMIN, DINKES**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Query Parameters:
  - status (string, opsional) - Filter status laporan
  - page (integer, opsional, default: 1)
  - limit (integer, opsional, default: 10)

Response:
- 200 OK:
  ```json
  {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "reports": [ { ...emergencyReport, school: { ...school }, user: { ...user } } ]
  }
  ```

---

#### Update Emergency Report Status (Admin & Dinkes)
Endpoint: **PUT /reports/emergency/:id**
Deskripsi: Mengubah status laporan darurat.
Otorisasi: Token (**Role: ADMIN, DINKES**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path Parameters:
  - id (integer)
- Body:
  ```json
  {
    "status": "string (wajib, salah satu: BARU, DITINDAKLANJUTI, SELESAI)"
  }
  ```

Response:
- 200 OK:
  ```json
  { "report": { ...emergencyReport } }
  ```
- 404 Not Found

---

### Dashboard

#### Get School Dashboard Summary
Endpoint: **GET /dashboard/school**
Deskripsi: Ringkasan data sekolah (total siswa, jumlah absen hari ini, laporan darurat baru).
Otorisasi: Token (**Role: SEKOLAH**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  {
    "totalSiswa": "integer",
    "sudahAbsen": "integer",
    "laporanBaru": "integer"
  }
  ```

---

#### Get Catering Dashboard Summary
Endpoint: **GET /dashboard/catering**
Deskripsi: Ringkasan rating dan feedback menu katering hari ini.
Otorisasi: Token (**Role: KATERING**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  {
    "rataRataRating": "float",
    "jumlahFeedback": "integer"
  }
  ```

---

#### Get Admin Dashboard Summary
Endpoint: **GET /dashboard/admin**
Deskripsi: Ringkasan global (total sekolah, total pengguna, total laporan darurat).
Otorisasi: Token (**Role: ADMIN, DINKES**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  {
    "totalSekolah": "integer",
    "totalPengguna": "integer",
    "totalLaporanDarurat": "integer"
  }
  ```

---

> Untuk detail field pada objek user, cateringLog, feedback, emergencyReport, dan school, silakan lihat skema database atau tanyakan pada tim backend.
