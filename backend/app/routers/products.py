from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.database import get_db
from app.schemas import ProductCreate, ProductOut, ProductUpdate
from app.utils import parse_object_id, serialize_doc, utc_now

router = APIRouter(prefix="/products", tags=["products"])


def _to_product(doc: dict) -> ProductOut:
    return ProductOut(**serialize_doc(doc))


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate):
    db = get_db()
    now = utc_now()
    doc = {
        "name": payload.name.strip(),
        "sku": payload.sku.strip().upper(),
        "price": round(payload.price, 2),
        "quantity_in_stock": payload.quantity_in_stock,
        "created_at": now,
        "updated_at": now,
    }
    try:
        result = db.products.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Product SKU must be unique")
    doc["_id"] = result.inserted_id
    return _to_product(doc)


@router.get("", response_model=list[ProductOut])
def list_products():
    db = get_db()
    docs = db.products.find().sort("name", 1)
    return [_to_product(d) for d in docs]


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str):
    db = get_db()
    try:
        oid = parse_object_id(product_id)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid product ID")
    doc = db.products.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return _to_product(doc)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: str, payload: ProductUpdate):
    db = get_db()
    try:
        oid = parse_object_id(product_id)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid product ID")

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if not updates:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No fields to update")
    if "sku" in updates:
        updates["sku"] = updates["sku"].strip().upper()
    if "name" in updates:
        updates["name"] = updates["name"].strip()
    if "price" in updates:
        updates["price"] = round(updates["price"], 2)
    if "quantity_in_stock" in updates and updates["quantity_in_stock"] < 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Quantity cannot be negative")

    updates["updated_at"] = utc_now()

    try:
        result = db.products.find_one_and_update(
            {"_id": oid},
            {"$set": updates},
            return_document=True,
        )
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Product SKU must be unique")

    if not result:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return _to_product(result)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str):
    db = get_db()
    try:
        oid = parse_object_id(product_id)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid product ID")
    result = db.products.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
