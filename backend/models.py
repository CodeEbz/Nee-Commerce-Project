from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, (str, bytes)):
            raise TypeError("ObjectId must be a string or bytes")
        return str(v)

class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    nickname: Optional[str] = None
    hashed_password: str
    full_name: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class Product(BaseModel):
    code: str
    whatsapp_id: Optional[str] = None
    name: str
    price: float
    description: Optional[str] = None
    image: Optional[str] = None
    featured: bool = False

class Business(BaseModel):
    id: str = Field(..., alias="_id") # Slugs are used as IDs in the current system
    name: str
    slug: str
    category: str
    description: Optional[str] = None
    whatsapp_link: Optional[str] = None
    hero_image: Optional[str] = None
    logo: Optional[str] = None
    featured: bool = False
    owner_id: Optional[str] = None
    products: List[Product] = []

    class Config:
        populate_by_name = True

class OrderItem(BaseModel):
    product_code: str
    name: str
    price: float
    quantity: int
    business_name: str

class OrderStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class Order(BaseModel):
    id: str = Field(..., alias="_id") # ORDs are used as IDs
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    total_amount: float
    payment_method: str = "card"
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    items: List[OrderItem]

    class Config:
        populate_by_name = True
