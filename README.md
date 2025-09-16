# Resume Optimizer Login App

A MERN-based login application with JWT authentication (TypeScript, Express, MongoDB, React + Vite). The backend also includes optional ATS utilities (resume analyze/enhance/score) that you can ignore if you only need login/auth.

## Tech Stack
- Backend: Node.js, Express, TypeScript, Mongoose, JWT, Zod, Helmet, CORS
- Frontend: React, Vite, TypeScript, React Router
- Database: MongoDB (local Docker or MongoDB Atlas)
- Containerization: Docker & Docker Compose
- CI: GitHub Actions

---

## Quick Start (Local)

Prerequisites:
- Node.js 18+ and npm
- MongoDB running locally (or connection string to Atlas)

1) Backend setup
- Copy env example:
  - Windows PowerShell
    - Copy-Item backend/.env.example backend/.env
  - bash
    - cp backend/.env.example backend/.env
- Edit backend/.env as needed:
  - PORT=4000
  - MONGO_URI=mongodb://localhost:27017/login_db (or your Atlas URI)
  - JWT_SECRET=replace_me_with_a_long_random_string
  - CLIENT_ORIGIN=http://localhost:5173
- Install and run:
  - cd backend
  - npm ci
  - npm run dev

2) Frontend setup
- Copy env example:
  - Windows PowerShell
    - Copy-Item frontend/.env.example frontend/.env
  - bash
    - cp frontend/.env.example frontend/.env
- Edit frontend/.env as needed:
  - VITE_API_URL=http://localhost:4000
- Install and run:
  - cd frontend
  - npm ci
  - npm run dev

Backend: http://localhost:4000
Frontend: http://localhost:5173

---

## Quick Start (Docker Compose)

Prerequisites:
- Docker Desktop

Commands:
- Windows PowerShell (set a stronger secret before first run):
  - $env:JWT_SECRET = "your_long_random_secret"
  - docker compose up --build -d
- Stop stack:
  - docker compose down

Services:
- MongoDB: 27017
- API: http://localhost:4000
- Web: http://localhost:5173

---

## Environment Variables

Backend (backend/.env):
- PORT: API port (default 4000)
- MONGO_URI: MongoDB connection string
- JWT_SECRET: long random string used to sign JWTs
- CLIENT_ORIGIN: CORS origin (http://localhost:5173 for local dev)

Frontend (frontend/.env):
- VITE_API_URL: API base URL (http://localhost:4000 for local dev)

Docker Compose also accepts JWT_SECRET from your shell; otherwise it uses a weak default.

---

## API Overview (Auth & Users)
Base URL: http://localhost:4000

- Health
  - GET /health -> { status: "ok" }

- Auth
  - POST /api/auth/register { name, email, password }
  - POST /api/auth/login { email, password }
  - GET /api/auth/me (Bearer token) -> current user

- Users (Bearer token required unless noted)
  - GET /api/users/me -> profile
  - PATCH /api/users/me { name }
  - PATCH /api/users/me/password { currentPassword, newPassword }
  - POST /api/users/me/avatar (form-data, key: avatar)
  - GET /api/users/:id/avatar (public) -> image bytes

Optional ATS utilities (if you use them):
- POST /api/ats/analyze (Bearer, form-data: resume, body: { jd })
- POST /api/ats/enhance (Bearer, body: { resumeText, missingKeywords?, jd? })
- POST /api/ats/score (Bearer, body: { resumeText, jd })

---

## Production Deployment (overview)

Backend options:
- Render or Railway (Node service). Env vars: PORT, MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
- Database: MongoDB Atlas (recommended for production)

Frontend options:
- Vercel or Netlify (static site). Env vars: VITE_API_URL

CORS: Set CLIENT_ORIGIN on the backend to your deployed frontend URL (e.g., https://your-frontend.vercel.app).
Frontend build: Set VITE_API_URL to your deployed backend URL.

---

## CI (GitHub Actions)

A workflow at .github/workflows/ci.yml builds backend and frontend on every push/PR.

---

## Scripts

Backend
- npm run dev -> start in watch mode (ts-node-dev)
- npm run build -> compile TypeScript to dist
- npm start -> run compiled app

Frontend
- npm run dev -> Vite dev server
- npm run build -> Vite production build
- npm run preview -> preview build

---

## Security Notes
- Never commit real secrets. Use .env files locally and deployment secrets in your hosting provider.
- Use strong JWT_SECRET in production.
- Limit CORS origins in production (avoid "*").
