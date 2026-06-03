from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import get_client, init_indexes
from app.routers import customers, dashboard, orders, products


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_indexes()
    yield
    get_client().close()


app = FastAPI(
    title="Ethara Inventory API",
    description="Inventory & Order Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "inventory-api"}
