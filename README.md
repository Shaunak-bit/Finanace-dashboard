# Finance Dashboard Backend

A production-ready finance dashboard backend built with Express, TypeScript, Prisma, and PostgreSQL.

---

## 🚀 Live API

Base URL:
https://finanace-dashboard-1-9m2s.onrender.com

---

## 📬 API Documentation

Postman Docs:
https://documenter.getpostman.com/view/53763043/2sBXiqE8qu

---

## 🧾 Overview

This project implements a role-based finance backend with:

* JWT authentication
* Role-based access control (`ADMIN`, `ANALYST`, `VIEWER`)
* Financial record CRUD operations
* Filtering, pagination, and validation
* Dashboard analytics (summary, category breakdown, trends)
* Secure middleware-based authorization

---

## 🛠 Tech Stack

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL (Supabase)
* JSON Web Tokens (JWT)

---

## 🗄 Database

* PostgreSQL (hosted on Supabase)
* Managed via Prisma ORM
* Schema and migrations handled using Prisma CLI

---

## 📁 Project Structure

```
src/
  controllers/
  routes/
  middleware/
  lib/
  types/
prisma/
  schema.prisma
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
PORT=5000
```

### 3. Run migrations

```bash
npx prisma migrate dev --name init
```

### 4. Start server

```bash
npm run dev
```

---

## 🚀 Deployment

Deployed using Render.

**Build Command:**

```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Start Command:**

```bash
npm start
```

---

## 🔐 Authentication

### POST `/api/auth/register`

Create a new user (default role: `VIEWER`)

```json
{
  "email": "test@example.com",
  "name": "Test User",
  "password": "123456"
}
```

---

### POST `/api/auth/login`

```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "message": "Login successful",
  "token": "jwt_token_here"
}
```

---

## 👥 User Management (ADMIN only)

* `POST /api/users`
* `GET /api/users`
* `PATCH /api/users/:userId/role`
* `PATCH /api/users/:userId/status`

---

## 💰 Financial Records

* `POST /api/records` (ADMIN)
* `GET /api/records` (ADMIN, ANALYST)
* `PATCH /api/records/:id` (ADMIN)
* `DELETE /api/records/:id` (ADMIN)

Supports:

* Pagination
* Filters (type, category, date)

---

## 📊 Dashboard APIs

* `GET /api/dashboard/summary`
* `GET /api/dashboard/categories`
* `GET /api/dashboard/recent`
* `GET /api/dashboard/monthly`

---

## 🔒 Access Control

| Role    | Permissions              |
| ------- | ------------------------ |
| VIEWER  | Dashboard only           |
| ANALYST | Read records + dashboard |
| ADMIN   | Full access              |

---

## ⚠️ Validation & Errors

* `400` → Bad request
* `401` → Unauthorized
* `403` → Forbidden
* `404` → Not found
* `500` → Server error

---

## 🧠 Assumptions

* Each record belongs to the authenticated user
* Users default to `VIEWER` role on signup
* Dashboard data is user-specific
* Inactive users are stored but not enforced

---

## ⚖️ Tradeoffs

* No automated tests included
* No Swagger/OpenAPI (Postman used instead)
* No role hierarchy abstraction
* Limited enforcement for inactive users

---

## 📌 Notes

* Prisma client generation handled during build and runtime
* Designed with scalability and clean architecture in mind

---

## ✅ Conclusion

This project demonstrates:

* Clean backend architecture
* Secure role-based access control
* Scalable API design
* Real-world deployment practices

---

🚀 Ready for production use and extensibility.
