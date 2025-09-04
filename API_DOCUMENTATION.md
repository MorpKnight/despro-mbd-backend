# API Documentation - MBG Review & Track

> **Update September 2025:**
> - All IDs (userId, schoolId, etc.) are of type UUID (string), not integer.
> - Role `MASTERADMIN` can only create, modify, and delete users with the `MASTERADMIN` role.
> - Special endpoint: POST `/users/masteradmin` to create MASTERADMIN user.
> - Validation errors can be an array of `errors` (see example below).
> - API Key for attendance endpoint is taken from the `apiKey` field in the School model.
> - Example object structures (user, school, etc.) added at the end.

## Table of Contents

- [Introduction](#introduction)
- [General Information](#general-information)
  - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [Response Format](#response-format)
  - [Common Status Codes](#common-status-codes)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
    - [Register User](#register-user)
    - [Login User](#login-user)
    - [Get Profile](#get-profile)
  - [Users (Admin & MASTERADMIN)](#users-admin--masteradmin)
    - [Get All Users](#get-all-users)
    - [Create User](#create-user)
    - [Create User MASTERADMIN](#create-user-masteradmin)
    - [Get User by ID](#get-user-by-id)
    - [Update User](#update-user)
    - [Delete User](#delete-user)
  - [Attendance (Raspberry Pi Synchronization)](#attendance-raspberry-pi-synchronization)
    - [Sync Attendance](#sync-attendance)
  - [Catering](#catering)
    - [Create Catering Log](#create-catering-log)
    - [Get Catering Logs by Caterer](#get-catering-logs-by-caterer)
  - [Feedback (Student)](#feedback-student)
    - [Get Today's Menu](#get-todays-menu)
    - [Submit Feedback](#submit-feedback)
    - [Get My Feedback History](#get-my-feedback-history)
  - [Emergency Reports](#emergency-reports)
    - [Create Emergency Report (School)](#create-emergency-report-school)
    - [Get Emergency Reports by My School](#get-emergency-reports-by-my-school)
    - [Get All Emergency Reports (Admin & Health Dept)](#get-all-emergency-reports-admin--health-dept)
    - [Update Emergency Report Status (Admin & Health Dept)](#update-emergency-report-status-admin--health-dept)
  - [Dashboard](#dashboard)
    - [Get School Dashboard Summary](#get-school-dashboard-summary)
    - [Get Catering Dashboard Summary](#get-catering-dashboard-summary)
    - [Get Admin Dashboard Summary](#get-admin-dashboard-summary)

## Introduction
MBG Review & Track API is a RESTful backend designed to support monitoring, attendance tracking, and food menu review applications in school environments. This API provides features for authentication, user management, attendance data synchronization, catering menu management, student feedback, emergency reports, and data summary dashboards. All endpoints use JSON format and JWT for authentication.

## General Information

### Base URL
- Development: `http://localhost:3000/v1`
- Production: `https://api.mbg-app.com/v1`

### Authentication
- API uses JWT (JSON Web Token).
- Token sent in header:
  - `Authorization: Bearer <JWT_TOKEN>`

### Response Format
- Success: Status 2xx, data in JSON format.
- Error: Status 4xx/5xx, response:
  ```json
  {
    "error": "Descriptive error message"
  }
  ```

### Common Status Codes
| Code | Meaning |
|------|---------|
| 200  | OK (Request successful) |
| 201  | Created (Data created successfully) |
| 400  | Bad Request (Invalid request) |
| 401  | Unauthorized (Token invalid/expired) |
| 403  | Forbidden (Access denied) |
| 404  | Not Found (Resource not found) |
| 422  | Unprocessable Entity (Validation failed) |
| 500  | Internal Server Error (Server error) |

---

## Endpoints API

### Authentication

#### Register User
Endpoint: **POST /auth/register**
Description: Register new account.
Authorization: Public

Request:
- Headers:
  - Content-Type: application/json
- Body:
  ```json
  {
    "namaLengkap": "string (required)",
    "email": "string (required)",
    "password": "string (required, min 8 characters)",
    "role": "string (required, one of: ADMIN, SISWA, SEKOLAH, KATERING, DINKES)",
    "nfcTagId": "string (optional)",
    "schoolId": "string (UUID, optional, for role SISWA)"
  }
  ```

Response:
- 201 Created:
  ```json
  {
    "token": "string (JWT)",
    "user": {
      "id": "string (UUID)",
      "namaLengkap": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- 400 Bad Request:
  ```json
  { "error": "Email already registered." }
  ```
- 422 Unprocessable Entity:
  ```json
  { "errors": [ { "msg": "Invalid email." } ] }
  ```

---

#### Login User
Endpoint: **POST /auth/login**
Description: Login and get JWT token.
Authorization: Public

Request:
- Headers:
  - Content-Type: application/json
- Body:
  ```json
  {
    "email": "string (required)",
    "password": "string (required)"
  }
  ```

Response:
- 200 OK:
  ```json
  {
    "token": "string (JWT)",
    "user": {
      "id": "string (UUID)",
      "namaLengkap": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- 401 Unauthorized:
  ```json
  { "error": "Invalid email or password." }
  ```
- 422 Unprocessable Entity:
  ```json
  { "errors": [ { "msg": "Email is required." } ] }
  ```

---

#### Get Profile
Endpoint: **GET /auth/me**
Description: Get profile data of the currently logged-in user.
Authorization: Token (All roles)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  {
    "user": {
      "id": "string (UUID)",
      "namaLengkap": "string",
      "email": "string",
      "role": "string",
      "nfcTagId": "string"
    }
  }
  ```
- 401 Unauthorized:
  ```json
  { "error": "Invalid token." }
  ```

---

### Users (Admin & MASTERADMIN)

#### Get All Users
Endpoint: **GET /users**
Description: Get a list of all users (with pagination).
Authorization: Token (**Role: ADMIN, MASTERADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Query Parameters:
  - page (integer, optional, default: 1)
  - limit (integer, optional, default: 10)

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
Description: Create a new user (roles other than MASTERADMIN).
Authorization: Token (**Role: ADMIN, MASTERADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "namaLengkap": "string (required)",
    "email": "string (required)",
    "password": "string (required)",
    "role": "string (required)",
    "nfcTagId": "string (optional)",
    "schoolId": "string (UUID, optional)"
  }
  ```

Response:
- 201 Created:
  ```json
  { "user": { ...user } }
  ```
- 400 / 422 / 401 / 403

---

#### Create User MASTERADMIN
Endpoint: **POST /users/masteradmin**
Description: Create MASTERADMIN user (MASTERADMIN only).
Authorization: Token (**Role: MASTERADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "namaLengkap": "string (required)",
    "email": "string (required)",
    "password": "string (required)",
    "role": "string (required, must be MASTERADMIN)",
    "nfcTagId": "string (optional)",
    "schoolId": "string (UUID, optional)"
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
Description: Get details of a single user.
Authorization: Token (**Role: ADMIN, MASTERADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path Parameters:
  - id (string (UUID))

Response:
- 200 OK:
  ```json
  { "user": { ...user } }
  ```
- 404 Not Found

---

#### Update User
Endpoint: **PUT /users/:id**
Description: Update user data. Users with MASTERADMIN role can only be modified by MASTERADMIN.
Authorization: Token (**Role: ADMIN, MASTERADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path Parameters:
  - id (string (UUID))
- Body:
  ```json
  {
    "namaLengkap": "string (optional)",
    "email": "string (optional)",
    "password": "string (optional)",
    "role": "string (optional)",
    "nfcTagId": "string (optional)",
    "schoolId": "string (UUID, optional)"
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
Description: Delete a user. Users with MASTERADMIN role can only be deleted by MASTERADMIN.
Authorization: Token (**Role: ADMIN, MASTERADMIN**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path Parameters:
  - id (string (UUID))

Response:
- 200 OK:
  ```json
  { "message": "User deleted." }
  ```
- 404 Not Found

---

### Attendance (Raspberry Pi Synchronization)

#### Sync Attendance
Endpoint: **POST /attendance/sync**
Description: Synchronize attendance data from Raspberry Pi device to server.
Authorization: Header API Key (X-API-KEY, obtained from school)

Request:
- Headers:
  - Content-Type: application/json
  - X-API-KEY: string (required, taken from apiKey field in School model)
- Body:
  ```json
  {
    "logs": [
      {
        "nfcTagId": "string (required)",
        "timestamp": "string (ISO 8601, required)"
      }
    ]
  }
  ```

Response:
- 201 Created:
  ```json
  { "message": "Attendance logs synced successfully.", "count": 10 }
  ```
- 403 Forbidden (Invalid API Key)
- 404 Not Found (No valid logs)

---

### Catering

#### Create Catering Log
Endpoint: **POST /catering**
Description: Caterer uploads daily menu log.
Authorization: Token (**Role: KATERING**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "schoolId": "string (UUID, required)",
    "tanggal": "string (YYYY-MM-DD, required)",
    "deskripsiMenu": "string (required)",
    "fotoMenuUrl": "string (required)",
    "catatan": "string (optional)"
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
Description: View daily menu logs uploaded by the currently logged-in caterer.
Authorization: Token (**Role: KATERING**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Query Parameters:
  - page (integer, optional, default: 1)
  - limit (integer, optional, default: 10)

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

### Feedback (Student)

#### Get Today's Menu
Endpoint: **GET /feedback/menu/today**
Description: Get today's catering menu for the currently logged-in student's school.
Authorization: Token (**Role: SISWA**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  { "menu": { ...cateringLog } }
  ```
- 404 Not Found (Menu not available)

---

#### Submit Feedback
Endpoint: **POST /feedback**
Description: Student submits feedback for today's catering menu.
Authorization: Token (**Role: SISWA**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "cateringLogId": "string (UUID, required)",
    "rating": "integer (required, 1-5)",
    "komentar": "string (optional)"
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
Description: View feedback history submitted by the student.
Authorization: Token (**Role: SISWA**)

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

#### Create Emergency Report (School)
Endpoint: **POST /reports/emergency**
Description: School sends emergency report (e.g., suspected food poisoning).
Authorization: Token (**Role: SEKOLAH**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "deskripsi": "string (required)"
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
Description: View history of emergency reports sent by the school.
Authorization: Token (**Role: SEKOLAH**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

Response:
- 200 OK:
  ```json
  { "reports": [ { ...emergencyReport } ] }
  ```

---

#### Get All Emergency Reports (Admin & Health Dept)
Endpoint: **GET /reports/emergency**
Description: View all emergency reports from all schools.
Authorization: Token (**Role: ADMIN, DINKES**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Query Parameters:
  - status (string, optional) - Filter report status
  - page (integer, optional, default: 1)
  - limit (integer, optional, default: 10)

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

#### Update Emergency Report Status (Admin & Health Dept)
Endpoint: **PUT /reports/emergency/:id**
Description: Update emergency report status.
Authorization: Token (**Role: ADMIN, DINKES**)

Request:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path Parameters:
  - id (string (UUID))
- Body:
  ```json
  {
    "status": "string (required, one of: BARU, DITINDAKLANJUTI, SELESAI)"
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
Description: School data summary (total students, today's attendance count, new emergency reports).
Authorization: Token (**Role: SEKOLAH**)

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
Description: Summary of ratings and feedback for today's catering menu.
Authorization: Token (**Role: KATERING**)

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
Description: Global summary (total schools, total users, total emergency reports).
Authorization: Token (**Role: ADMIN, DINKES**)

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

## Example Object Structures

### User
```json
{
  "id": "string (UUID)",
  "namaLengkap": "string",
  "email": "string",
  "password": "string (hashed)",
  "role": "MASTERADMIN | ADMIN | SISWA | SEKOLAH | KATERING | DINKES",
  "nfcTagId": "string (optional)",
  "SchoolId": "string (UUID, optional)"
}
```

### School
```json
{
  "id": "string (UUID)",
  "namaSekolah": "string",
  "alamat": "string",
  "apiKey": "string (UUID)"
}
```

### CateringLog
```json
{
  "id": "string (UUID)",
  "tanggal": "string (YYYY-MM-DD)",
  "deskripsiMenu": "string",
  "fotoMenuUrl": "string",
  "catatan": "string (optional)",
  "SchoolId": "string (UUID)",
  "UserId": "string (UUID)"
}
```

### Feedback
```json
{
  "id": "string (UUID)",
  "rating": "integer (1-5)",
  "komentar": "string (optional)",
  "timestamp": "string (ISO 8601)",
  "CateringLogId": "string (UUID)",
  "UserId": "string (UUID)"
}
```

### EmergencyReport
```json
{
  "id": "string (UUID)",
  "deskripsi": "string",
  "status": "BARU | DITINDAKLANJUTI | SELESAI",
  "timestamp": "string (ISO 8601)",
  "SchoolId": "string (UUID)",
  "UserId": "string (UUID)"
}
```

---

## Example Validation Error

If validation fails, the error response may be:
```json
{
  "errors": [
    { "msg": "Invalid email.", "param": "email", "location": "body" },
    { "msg": "Password is required.", "param": "password", "location": "body" }
  ]
}
```

---
