# CareFlow EHR API Documentation

## Overview
CareFlow EHR is an Electronic Health Record system supporting multiple roles: Patient, Doctor, Nurse, Secretary, and Admin. All endpoints return JSON. Authentication is via JWT in the `Authorization` header.

---

## Authentication

### POST /api/auth/register
- **Description:** Register a new user.
- **Request Body:**
```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "123456"
}
```
- **Response:**
```json
{
  "message": "Registration successful. Please check your email."
}
```
- **Errors:**
  - 400: Missing or invalid data
  - 409: Email already exists

### POST /api/auth/login
- **Description:** Login and receive JWT.
- **Request Body:**
```json
{
  "email": "ali@example.com",
  "password": "123456"
}
```
- **Response:**
```json
{
  "token": "jwt_token",
  "user": { "id": "...", "name": "Ali" }
}
```
- **Errors:**
  - 401: Invalid credentials

---

## User Endpoints

### GET /api/user/me
- **Description:** Get current user profile.
- **Response:**
```json
{
  "id": "...",
  "name": "Ali",
  "email": "ali@example.com"
}
```
- **Errors:**
  - 401: Unauthorized

### GET /api/user/me/notifications
- **Description:** Get user notifications.
- **Response:**
```json
[
  { "id": "1", "message": "New appointment" }
]
```
- **Errors:**
  - 401: Unauthorized

---

## Doctor Endpoints

### GET /api/doctor/profile/me
- **Description:** Get doctor profile.
- **Response:**
```json
{
  "id": "...",
  "specialization": "Internal Medicine"
}
```
- **Errors:**
  - 401: Unauthorized

### POST /api/doctor/prescriptions/send-to-pharmacy
- **Description:** Send a prescription to the pharmacy.
- **Request Body:**
```json
{
  "prescriptionId": "..."
}
```
- **Response:**
```json
{
  "message": "Prescription sent to pharmacy",
  "result": { "status": "pending" }
}
```
- **Errors:**
  - 404: Prescription not found
  - 500: Pharmacy connection error

---

## Patient Endpoints

### GET /api/patient/record/me
- **Description:** Get patient record.
- **Response:**
```json
{
  "id": "...",
  "diagnosis": "..."
}
```
- **Errors:**
  - 401: Unauthorized

---

## Secretary Endpoints

### POST /api/secretary/patients
- **Description:** Create a new patient.
- **Request Body:**
```json
{
  "name": "Fatima",
  "email": "fatima@example.com"
}
```
- **Response:**
```json
{
  "id": "...",
  "name": "Fatima"
}
```
- **Errors:**
  - 400: Missing data

---

## Test Data
- Example name: "Test User"
- Example email: "test@example.com"
- Example password: "test123"

---

## Common Errors
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Internal server error

---

## Notes
- All protected endpoints require JWT in header: `Authorization: Bearer <token>`
- All responses are JSON.

For more details, see the code or contact the development team.
