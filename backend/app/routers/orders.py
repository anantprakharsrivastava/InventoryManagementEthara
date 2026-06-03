from fastapi import APIRouter, HTTPException, status
from pymongo import ReturnDocument

from app.database import get_db
from app.schemas import OrderCreate, OrderOut
from app.utils import parse_object_id, serialize_doc, utc_now

router = APIRouter(prefix="/orders", tags=["orders"])


def _to_order(doc: dict) -> OrderOut:
    data = serialize_doc(doc)
    data["customer_id"] = str(data["customer_id"])
    for item in data["items"]:
        item["product_id"] = str(item["product_id"])
    return OrderOut(**data)


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate):
    db = get_db()
    try:
        customer_oid = parse_object_id(payload.customer_id)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid customer ID")

    customer = db.customers.find_one({"_id": customer_oid})
    if not customer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")

    line_items = []
    total_amount = 0.0
    stock_updates: list[tuple] = []

    for item in payload.items:
        try:
            product_oid = parse_object_id(item.product_id)
        except ValueError:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Invalid product ID: {item.product_id}")

        product = db.products.find_one({"_id": product_oid})
        if not product:
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"Product not found: {item.product_id}")

        if product["quantity_in_stock"] < item.quantity:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Insufficient stock for {product['name']} (SKU: {product['sku']}). "
                f"Available: {product['quantity_in_stock']}, requested: {item.quantity}",
            )

        unit_price = round(float(product["price"]), 2)
        line_total = round(unit_price * item.quantity, 2)
        total_amount += line_total

        line_items.append(
            {
                "product_id": product_oid,
                "product_name": product["name"],
                "sku": product["sku"],
                "quantity": item.quantity,
                "unit_price": unit_price,
                "line_total": line_total,
            }
        )
        stock_updates.append((product_oid, item.quantity))

    for product_oid, qty in stock_updates:
        updated = db.products.find_one_and_update(
            {"_id": product_oid, "quantity_in_stock": {"$gte": qty}},
            {"$inc": {"quantity_in_stock": -qty}, "$set": {"updated_at": utc_now()}},
            return_document=ReturnDocument.AFTER,
        )
        if not updated:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Insufficient inventory while processing order. Please retry.",
            )

    order_doc = {
        "customer_id": customer_oid,
        "customer_name": customer["full_name"],
        "items": line_items,
        "total_amount": round(total_amount, 2),
        "created_at": utc_now(),
    }
    result = db.orders.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id
    return _to_order(order_doc)


@router.get("", response_model=list[OrderOut])
def list_orders():
    db = get_db()
    docs = db.orders.find().sort("created_at", -1)
    return [_to_order(d) for d in docs]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str):
    db = get_db()
    try:
        oid = parse_object_id(order_id)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid order ID")
    doc = db.orders.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    return _to_order(doc)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: str):
    db = get_db()
    try:
        oid = parse_object_id(order_id)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid order ID")

    doc = db.orders.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    for item in doc.get("items", []):
        db.products.update_one(
            {"_id": item["product_id"]},
            {"$inc": {"quantity_in_stock": item["quantity"]}, "$set": {"updated_at": utc_now()}},
        )

    db.orders.delete_one({"_id": oid})
