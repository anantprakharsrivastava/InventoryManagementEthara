from pymongo import ASCENDING, MongoClient
from pymongo.database import Database

from app.config import settings

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(settings.mongodb_uri)
    return _client


def get_db() -> Database:
    return get_client()[settings.database_name]


def init_indexes() -> None:
    db = get_db()
    db.products.create_index([("sku", ASCENDING)], unique=True)
    db.customers.create_index([("email", ASCENDING)], unique=True)
    db.orders.create_index([("created_at", ASCENDING)])
