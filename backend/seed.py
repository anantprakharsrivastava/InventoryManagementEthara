"""Seed sample inventory data. Run: python seed.py"""
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
db_name = os.getenv("DATABASE_NAME", "ethara_inventory")

client = MongoClient(uri)
db = client[db_name]

db.products.delete_many({})
db.customers.delete_many({})
db.orders.delete_many({})

now = datetime.now(timezone.utc)

db.products.insert_many(
    [
        {"name": "Wireless Mouse", "sku": "WM-001", "price": 29.99, "quantity_in_stock": 50, "created_at": now, "updated_at": now},
        {"name": "USB-C Hub", "sku": "HUB-002", "price": 45.0, "quantity_in_stock": 8, "created_at": now, "updated_at": now},
        {"name": "Mechanical Keyboard", "sku": "KB-003", "price": 89.99, "quantity_in_stock": 3, "created_at": now, "updated_at": now},
    ]
)

db.customers.insert_many(
    [
        {"full_name": "Anant Prakhar", "email": "anant@example.com", "phone": "+91-9876543210", "created_at": now},
        {"full_name": "Priya Sharma", "email": "priya@example.com", "phone": "+91-9123456789", "created_at": now},
    ]
)

print("Seed complete: 3 products, 2 customers.")
client.close()
