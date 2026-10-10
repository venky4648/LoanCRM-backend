# Loan CRM Backend API Service

Node.js / Express / MongoDB Atlas backend microservice for the **Loan CRM** application, featuring User Authentication (Register & Login), Password Hashing, JWT Session Tokens, and Role-Based Access Control (RBAC).

---

## Features
- **Authentication**: User Registration (`POST /api/v1/auth/register`), Login (`POST /api/v1/auth/login`), and Authenticated Session (`GET /api/v1/auth/me`).
- **Security**: Password hashing using `bcryptjs` (salt factor 10) and JWT Bearer token authorization.
- **Database**: Mongoose connection configured to your MongoDB Atlas cluster (`loan_crm_db`).
- **User Roles Supported**:
  - `admin` (Founder & Managing Director)
  - `sales` (Senior Tele-Calling & Sales Exec)
  - `processing` (Lead Loan Processing Officer)
  - `viewer` (External Auditor / Operations Viewer)
  - `student` (Borrower / Student Applicant)

---

## Directory Structure
```
backend/
├── .env                  # Environment configuration (MongoDB URI & JWT Secret)
├── .env.example          # Environment template with placeholders
├── .gitignore            # Git ignore configuration
├── package.json          # Dependencies (express, mongoose, bcryptjs, jsonwebtoken, cors)
├── README.md             # API documentation & setup guide
└── src/
    ├── index.js          # Express app entry point
    ├── config/
    │   ├── db.js         # MongoDB connection handler
    │   └── env.js        # Strict environment variable parser
    ├── controllers/
    │   └── authController.js # Register, Login, GetMe business logic
    ├── middleware/
    │   └── authMiddleware.js # Protect (JWT verification) & Authorize (RBAC)
    ├── models/
    │   └── User.js       # Mongoose User schema & password hashing pre-hook
    └── routes/
        └── authRoutes.js # Express router mapping auth endpoints
```

---

## Quick Start (Local Setup)

1. Navigate to the backend folder:
   ```bash
   cd "c:\Users\pavan\OneDrive\Desktop\loan CRM\backend"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

   The server will connect to MongoDB Atlas and start listening on `http://localhost:5000`.

---

## API Documentation

### 1. Register User (`POST /api/v1/auth/register`)
**Request Body**:
```json
{
  "name": "Venkatesh Kota",
  "email": "venkatesh.k@normiloans.com",
  "password": "Password123!",
  "role": "admin",
  "roleTitle": "Founder & Managing Director",
  "department": "Executive Management",
  "mobile": "9876543210"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": "6707a...",
    "name": "Venkatesh Kota",
    "email": "venkatesh.k@normiloans.com",
    "role": "admin",
    "roleTitle": "Founder & Managing Director",
    "department": "Executive Management",
    "mobile": "9876543210",
    "status": "active"
  }
}
```

---

### 2. User Login (`POST /api/v1/auth/login`)
**Request Body**:
```json
{
  "email": "venkatesh.k@normiloans.com",
  "password": "Password123!"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": "6707a...",
    "name": "Venkatesh Kota",
    "email": "venkatesh.k@normiloans.com",
    "role": "admin",
    "roleTitle": "Founder & Managing Director",
    "department": "Executive Management",
    "mobile": "9876543210",
    "status": "active"
  }
}
```

---

### 3. Get Authenticated User (`GET /api/v1/auth/me`)
**Header**: `Authorization: Bearer <token>`  
**Response (`200 OK`)**:
```json
{
  "success": true,
  "user": {
    "id": "6707a...",
    "name": "Venkatesh Kota",
    "email": "venkatesh.k@normiloans.com",
    "role": "admin",
    "roleTitle": "Founder & Managing Director",
    "department": "Executive Management",
    "mobile": "9876543210",
    "status": "active"
  }
}
```
