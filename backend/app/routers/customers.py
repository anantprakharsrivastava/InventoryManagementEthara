from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.database import get_db
from app.schemas import CustomerCreate, CustomerOut
from app.utils import parse_object_id, serialize_doc, utc_now

router = APIRouter(prefix="/customers", tags=["customers"])


def _to_customer(doc: dict) -> CustomerOut:
    return CustomerOut(**serialize_doc(doc))


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate):
    db = get_db()
    doc = {
        "full_name": payload.full_name.strip(),
        "email": payload.email.strip().lower(),
        "phone": payload.phone.strip(),
        "created_at": utc_now(),
    }
    try:
        result = db.customers.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Customer email must be unique")
    doc["_id"] = result.inserted_id
    return _to_customer(doc)


@router.get("", response_model=list[CustomerOut])
def list_customers():
    db = get_db()
    return [_to_customer(d) for d in db.customers.find().sort("full_name", 1)]


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: str):
    db = get_db()
    try:
        oid = parse_object_id(customer_id)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid customer ID")
    doc = db.customers.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
    return _to_customer(doc)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: str):
    db = get_db()
    try:
        oid = parse_object_id(customer_id)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid customer ID")
    if db.orders.count_documents({"customer_id": oid}) > 0:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Cannot delete customer with existing orders",
        )
    result = db.customers.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
