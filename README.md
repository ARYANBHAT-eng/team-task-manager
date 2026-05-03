# 🚀 Team Task Manager (Full-Stack)

A full-stack web application that allows teams to manage projects, assign tasks, and track progress with **role-based access control (RBAC)**.

---

## 🔥 Features

### 🔐 Authentication

* User Signup & Login (JWT-based)
* Secure password hashing (bcrypt)

### 📁 Project Management

* Create and manage projects
* Project creator becomes **Admin**

### 👥 Team Management

* Add/remove members to projects (Admin only)
* Project-scoped roles (Admin / Member)

### ✅ Task Management

* Create, assign, update, delete tasks
* Task status tracking:

  * Todo
  * In Progress
  * Done
* Assignment restricted to project members

### 📊 Dashboard

* Task summary (total, completed, overdue)
* Overdue task highlighting
* Assigned tasks visibility

### 🔐 Role-Based Access Control (RBAC)

* Admin:

  * Manage members
  * Full task control
* Member:

  * Can only edit tasks assigned to them
* Enforced at **backend + reflected in frontend**

---

## 🧠 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios

### Backend

* FastAPI
* SQLAlchemy
* JWT Authentication

### Database

* PostgreSQL

### Deployment

* Backend: Railway
* Frontend: Vercel / Railway

---

## 🏗️ Architecture

### Core Entities

* User
* Project
* ProjectMembership (RBAC layer)
* Task

> Roles are **project-scoped**, not global.

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/ARYANBHAT-eng/team-task-manager
cd team-task-manager
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows
pip install -r requirements.txt
```

#### Create `.env`

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskdb
JWT_SECRET_KEY=your_secret
API_V1_PREFIX=/api
CORS_ORIGINS=["http://localhost:5173"]
```

#### Run Backend

```bash
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### Create `.env`

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

#### Run Frontend

```bash
npm run dev
```

---

## 🧪 Demo Flow

1. Signup & Login
2. Create a Project (becomes Admin)
3. Add a Member
4. Create & Assign Tasks
5. Login as Member
6. Demonstrate restricted actions
7. View Dashboard insights

---

## ⚠️ Notes

* Password length is limited to 72 characters due to bcrypt
* Roles are **project-specific**, not global
* Backend enforces all permissions (frontend only reflects)

---

## 🚀 Future Improvements

* Add email-based member invite
* Implement database migrations (Alembic)
* Add automated tests

---

## 👨‍💻 Author

Aryan Bhat
GitHub: https://github.com/ARYANBHAT-eng
