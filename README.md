# 🎓 CampusConnect – Full Stack Campus Management Platform

<p align="center">
  A centralized platform that connects students and administrators
  through announcements, events, study materials, discussions,
  and campus services.
</p>

<p align="center">
  <a href="https://campus-connect-tjp8.vercel.app">
    🚀 Live Demo
  </a>
</p>

---

## 📌 Overview

CampusConnect is a full-stack web application designed to simplify
communication and collaboration within a college campus.

The platform provides a centralized space where students can access
campus announcements, participate in events, share knowledge,
exchange study materials, and report lost or found items.

It also provides administrators with tools to manage campus activities
and monitor platform engagement.

## ✨ Key Features

### 🔐 Authentication & Authorization
- Student registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access control for students and administrators.

### 📢 Announcements
- Administrators can publish announcements.
- Students can view campus updates.

### 📅 Event Management
- Create and manage campus events.
- Students can register for events.
- Event capacity management.

### 📚 Study Materials
- Upload and download academic materials.
- Support for multiple document formats.

### 💬 Discussion Forum
- Create discussion posts.
- Comment on posts.
- Like discussions.

### 🔎 Lost & Found
- Report lost or found belongings.
- Browse submitted reports.
- Resolve reports.

### 📊 Admin Dashboard
- Dashboard statistics.
- Student management.
- Administrative controls.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| API Communication | Axios |
| File Uploads | Multer |
| Deployment | Vercel, Render |
| Version Control | Git, GitHub |

## 🏗️ Application Architecture

```text
             Student / Admin
                    |
                    v
             React Frontend
                 (Vercel)
                    |
                    v
              Axios API
                    |
                    v
             Express Backend
                 (Render)
                    |
          +---------+---------+
          |                   |
          v                   v
      MongoDB Atlas       File Uploads
          |
          v
      Application Data

      ## 🚀 How to Run Locally

**Backend:**
```bash
cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev