from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=64)
    price: float = Field(..., gt=0)
    quantity_in_stock: int = Field(..., ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    sku: str | None = Field(None, min_length=1, max_length=64)
    price: float | None = Field(None, gt=0)
    quantity_in_stock: int | None = Field(None, ge=0)


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    sku: str
    price: float
    quantity_in_stock: int
    created_at: datetime
    updated_at: datetime


class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=30)


class CustomerOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    created_at: datetime


class OrderItemIn(BaseModel):
    product_id: str = Field(..., min_length=1)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: str = Field(..., min_length=1)
    items: Annotated[list[OrderItemIn], Field(min_length=1)]

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: list[OrderItemIn]) -> list[OrderItemIn]:
        if not v:
            raise ValueError("At least one order item is required")
        return v


class OrderItemOut(BaseModel):
    product_id: str
    product_name: str
    sku: str
    quantity: int
    unit_price: float
    line_total: float


class OrderOut(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    items: list[OrderItemOut]
    total_amount: float
    created_at: datetime


class DashboardOut(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[ProductOut]
