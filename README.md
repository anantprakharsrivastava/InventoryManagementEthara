# Ethara Inventory & Order Management System

Production-ready **Inventory & Order Management** app built for the technical assessment:

- **Backend:** Python + FastAPI  
- **Frontend:** React (Vite)  
- **Database:** **MongoDB** (same stack as the original Ethara project — Atlas or Docker)  
- **Containerization:** Docker + Docker Compose  

> **Note:** The assessment template mentions PostgreSQL. This project intentionally uses **MongoDB** per product requirements to keep the existing database platform.

## Features

### Products
- `POST /products` · `GET /products` · `GET /products/{id}` · `PUT /products/{id}` · `DELETE /products/{id}`
- Fields: name, SKU, price, quantity in stock

### Customers
- `POST /customers` · `GET /customers` · `GET /customers/{id}` · `DELETE /customers/{id}`
- Fields: full name, email, phone

### Orders
- `POST /orders` · `GET /orders` · `GET /orders/{id}` · `DELETE /orders/{id}`
- Customer + product line items, quantity, **backend-calculated total**
- **Unique SKU** · **Unique email** · **No negative stock**
- **Insufficient stock blocked** · **Stock reduced on order** · **Stock restored on order delete**

### Dashboard
- `GET /dashboard` — totals + low stock (≤10 units)

## Quick start (Docker)

```bash
# From project root
docker compose up --build
```

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:8000 |
| API docs  | http://localhost:8000/docs |
| MongoDB   | localhost:27017 |

### Seed sample data

```bash
docker compose exec backend python seed.py
```

## Local development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit MONGODB_URI (local or Atlas)
uvicorn app.main:app --reload --port 8000
python seed.py
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `DATABASE_NAME` | Database name (default: `ethara_inventory`) |
| `CORS_ORIGINS` | Comma-separated frontend URLs |
| `PORT` | API port (default 8000) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL, e.g. `http://localhost:8000` |

## Docker Hub (submission)

Build and push the backend image:

```bash
docker build -t YOUR_DOCKERHUB_USER/ethara-inventory-api:latest ./backend
docker push YOUR_DOCKERHUB_USER/ethara-inventory-api:latest
```

## Deployment (free tier)

### Backend — Railway / Render / Fly.io

1. Deploy `./backend` (Root Directory: `backend`)
2. Set env: `MONGODB_URI` (MongoDB Atlas), `DATABASE_NAME`, `CORS_ORIGINS` (your Vercel URL)
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend — Vercel / Netlify

1. Root: `frontend`
2. `VITE_API_URL=https://your-api.example.com` (no trailing slash)
3. Redeploy after env changes

## Project structure

```
backend/
  app/           # FastAPI application
  Dockerfile
  requirements.txt
  seed.py
frontend/
  src/           # React UI
  Dockerfile
  nginx.conf
docker-compose.yml
```

## API documentation

Interactive docs: `http://localhost:8000/docs` (Swagger UI)

## Submission checklist

- [ ] GitHub repository link  
- [ ] Docker Hub backend image link  
- [ ] Live frontend URL (Vercel/Netlify)  
- [ ] Live backend API URL (Railway/Render)  
- [ ] `docker compose up` runs all three services  

## License

MIT
