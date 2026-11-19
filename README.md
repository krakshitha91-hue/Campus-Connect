# CampusConnect — Advanced MERN Stack Project

A student community portal built with React, Express, Node.js and MongoDB.

## Features
- Student registration/login with bcrypt password hashing and JWT authentication
- Student and admin roles
- Admin-managed announcements and events
- Event registration with capacity checks
- Study material uploads (PDF, DOC, DOCX, PPT, PPTX; 10 MB limit)
- Discussion forum with likes and comments
- Lost & Found reports with resolve workflow
- Admin dashboard with counts and member directory
- Responsive UI

## Requirements
- Node.js 18+
- MongoDB local service or MongoDB Atlas connection string

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env` and set `MONGO_URI` and a long random `JWT_SECRET`.

Run:
```bash
npm run dev
```
API runs at `http://localhost:5000`.

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

Optional: create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Create the first admin
For safety, public registration always creates a student account. After registering your own account, promote it directly in MongoDB:

```javascript
use campusconnect
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```
Log out and sign in again so the refreshed user profile contains the admin role.

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/announcements`, `POST /api/announcements` (admin), `DELETE /api/announcements/:id` (admin)
- `GET /api/events`, `POST /api/events` (admin), `POST /api/events/:id/register`, `DELETE /api/events/:id` (admin)
- `GET /api/notes`, `POST /api/notes` (authenticated upload), `DELETE /api/notes/:id` (owner/admin)
- `GET /api/posts`, `POST /api/posts`, `POST /api/posts/:id/like`, `POST /api/posts/:id/comments`, `DELETE /api/posts/:id`
- `GET /api/lost-found`, `POST /api/lost-found`, `PATCH /api/lost-found/:id/resolve`, `DELETE /api/lost-found/:id` (admin)
- `GET /api/users/stats`, `GET /api/users` (admin)

## Notes for production
This is a complete learning-project starter, not a production-hardened deployment. Before public deployment add rate limiting, stricter schema validation, secure cookie-based token storage or a carefully reviewed token strategy, email verification/password reset, antivirus scanning for uploads, pagination, audit logs, backups, HTTPS, and a managed file store such as S3/Cloudinary. Restrict CORS to your deployed frontend origin.
