from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import QualityStatus

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool = True
    is_admin: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        orm_mode = True

# Product schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    category_id: int
    unit_price: float

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Stock Item schemas
class StockItemBase(BaseModel):
    product_id: int
    quantity: int
    location: str
    batch_number: str
    manufacturing_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None

class StockItemCreate(StockItemBase):
    pass

class StockItemUpdate(StockItemBase):
    pass

class StockItem(StockItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Quality Check schemas
class QualityCheckBase(BaseModel):
    product_id: int
    batch_number: str
    status: QualityStatus
    notes: Optional[str] = None
    checked_by: int

class QualityCheckCreate(QualityCheckBase):
    pass

class QualityCheckUpdate(QualityCheckBase):
    pass

class QualityCheck(QualityCheckBase):
    id: int
    check_date: datetime

    class Config:
        orm_mode = True

# Forecast schemas
class ForecastBase(BaseModel):
    product_id: int
    forecast_date: datetime
    predicted_demand: int
    confidence_level: float = Field(..., ge=0.0, le=1.0)
    notes: Optional[str] = None

class ForecastCreate(ForecastBase):
    pass

class ForecastUpdate(ForecastBase):
    pass

class Forecast(ForecastBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Dashboard schemas
class DashboardStats(BaseModel):
    total_products: int
    total_stock_items: int
    quality_issues: int
    expiring_soon: int
    low_stock_items: int 