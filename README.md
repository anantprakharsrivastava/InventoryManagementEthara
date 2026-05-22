# Ethara — Task & Project Management Platform

A production-ready, modern SaaS-style project management web application with role-based access control, real-time notifications, Kanban boards, analytics dashboards, and team chat.

![Stack](https://img.shields.io/badge/React-Vite-61DAFB)
![Stack](https://img.shields.io/badge/Node-Express-339933)
![Stack](https://img.shields.io/badge/MongoDB-Atlas-47A248)

## Features

- **Authentication** — JWT signup/login, persistent sessions, bcrypt password hashing
- **Role-Based Access** — Admin (full control) vs Member (assigned work)
- **Projects** — CRUD, members, admins, status tracking
- **Tasks** — Priorities, statuses, assignments, comments, file uploads
- **Kanban Board** — Drag-and-drop with `@dnd-kit`
- **Dashboard** — Stats, Recharts analytics, team activity feed
- **Real-time** — Socket.io notifications & chat
- **UI** — Dark glassmorphism, Framer Motion, responsive design

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, React Router, Axios, Recharts |
| Backend | Node.js, Express, Mongoose, JWT, Socket.io, Multer |
| Database | MongoDB Atlas |

## Project Structure

```
etharaproject/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, upload, errors
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── seed/            # Sample data
│   └── server.js        # Entry point
├── frontend/
│   └── src/
│       ├── components/  # UI components
│       ├── context/     # Auth context
│       ├── hooks/       # Custom hooks
│       ├── layouts/     # Sidebar, header
│       ├── pages/       # Route pages
│       └── services/    # API & socket
└── README.md
```

## Quick Start (Local)

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET
npm install
npm run seed    # Optional: load demo data
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**

### Demo Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ethara.com | admin123 |
| Member | sarah@ethara.com | member123 |
| Member | james@ethara.com | member123 |

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
UPLOAD_PATH=uploads
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## API Documentation

See [API.md](./API.md) for full REST API reference.

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project (admin) |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| POST | `/api/tasks/:id/comment` | Add comment |
| GET | `/api/dashboard/stats` | Dashboard analytics |

## Deployment

### Frontend → Vercel

1. Push repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables:
   - `VITE_API_URL=https://your-api.railway.app/api`
   - `VITE_SOCKET_URL=https://your-api.railway.app`
5. Deploy

### Backend → Railway

1. Create project on [Railway](https://railway.app)
2. Connect GitHub repo, set root to `backend`
3. Add environment variables from `.env.example`
4. Deploy — Railway auto-detects Node.js

### MongoDB Atlas

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create database user & whitelist IP (`0.0.0.0/0` for cloud deploy)
3. Copy connection string to `MONGODB_URI`
4. Run seed: `npm run seed` (locally with production URI)

### Post-Deploy Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Update `CLIENT_URL` to Vercel domain
- [ ] Enable CORS for production frontend URL
- [ ] Run database seed or create admin manually

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | backend | Start API with nodemon |
| `npm start` | backend | Production server |
| `npm run seed` | backend | Seed sample data |
| `npm run dev` | frontend | Vite dev server |
| `npm run build` | frontend | Production build |

## License

MIT
