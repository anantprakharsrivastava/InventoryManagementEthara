from fastapi import APIRouter

from app.database import get_db
from app.routers.products import _to_product
from app.schemas import DashboardOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("", response_model=DashboardOut)
def get_dashboard():
    db = get_db()
    low_stock = [
        _to_product(d)
        for d in db.products.find({"quantity_in_stock": {"$lte": LOW_STOCK_THRESHOLD}}).sort(
            "quantity_in_stock", 1
        )
    ]
    return DashboardOut(
        total_products=db.products.count_documents({}),
        total_customers=db.customers.count_documents({}),
        total_orders=db.orders.count_documents({}),
        low_stock_products=low_stock,
    )
