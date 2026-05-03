# 🚀 Team Task Manager

A production-ready full-stack web application for managing projects, assigning tasks, and tracking team progress with role-based access control.

---

## 🔗 Live Application

- Frontend (Vercel)  
  https://team-task-manager-ten-drab.vercel.app  

- Backend API (Railway)  
  https://team-task-manager-production-f579.up.railway.app  

- API Docs (Swagger)  
  https://team-task-manager-production-f579.up.railway.app/docs  

---

## ✨ Core Features

- JWT-based Authentication (Signup/Login)
- Role-Based Access Control (Admin / Member)
- Project Creation & Team Management
- Task Assignment & Status Tracking
- Dashboard with task insights & overdue tracking
- Secure password hashing (bcrypt)

---

## 🧠 Role Permissions

| Feature | Admin | Member |
|--------|------|--------|
| Create Project | ✅ | ❌ |
| Add/Remove Members | ✅ | ❌ |
| Assign Tasks | ✅ | ❌ |
| Update Task Status | ✅ | ✅ |
| Delete Project | ✅ | ❌ |

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios

### Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- JWT Authentication

### Deployment
- Frontend → Vercel  
- Backend → Railway  
- Database → Railway PostgreSQL  

---

## ⚙️ Environment Configuration

### Backend (.env)

DATABASE_URL=your_postgres_url
JWT_SECRET_KEY=your_secret_key
CORS_ORIGINS=["https://your-vercel-url.vercel.app
"]


### Frontend (.env)

VITE_API_BASE_URL=https://your-railway-url/api


---

## 🧪 Local Development

### Backend

cd backend
python -m venv .venv
..venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload


### Frontend

cd frontend
npm install
npm run dev


---

## 📡 API Overview

| Method | Endpoint | Description |
|------|--------|------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login |
| GET | /api/projects | Get projects |
| POST | /api/tasks | Create task |
| GET | /api/dashboard | Dashboard stats |

---

## 🚧 Key Engineering Decisions

- FastAPI lifespan used for automatic DB table creation
- Centralized Axios client with JWT injection
- RBAC enforced at backend level
- Environment-based configuration for deployment
- Resolved bcrypt-passlib compatibility issue

---

## ⚠️ Edge Cases Handled

- Duplicate user signup prevention
- Token validation & expiry handling
- Protected routes (frontend + backend)
- Strict CORS handling
- SPA routing fix via vercel.json

---

## 📌 Project Status

- Fully functional
- Deployed (Frontend + Backend + DB)
- Production-ready
- Secure authentication implemented

---

## 👤 Author

Aryan Bhat  
https://github.com/ARYANBHAT-eng
