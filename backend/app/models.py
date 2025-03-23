from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base

# Enum tanımları
class QualityStatus(str, enum.Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    ACCEPTABLE = "ACCEPTABLE"
    POOR = "POOR"
    CRITICAL = "CRITICAL"


# Kullanıcı modeli
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)


# Kategori modeli
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)

    products = relationship("Product", back_populates="category")


# Ürün modeli
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    unit_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    stock_items = relationship("StockItem", back_populates="product")
    quality_checks = relationship("QualityCheck", back_populates="product")


# Stok öğesi modeli
class StockItem(Base):
    __tablename__ = "stock_items"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    location = Column(String)
    batch_number = Column(String, index=True)
    manufacturing_date = Column(DateTime, nullable=True)
    expiration_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="stock_items")


# Kalite kontrol modeli
class QualityCheck(Base):
    __tablename__ = "quality_checks"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    batch_number = Column(String, index=True)
    check_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(QualityStatus))
    notes = Column(Text, nullable=True)
    checked_by = Column(Integer, ForeignKey("users.id"))
    
    product = relationship("Product", back_populates="quality_checks")
    checker = relationship("User")


# Tahmin modeli
class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    forecast_date = Column(DateTime)
    predicted_demand = Column(Integer)
    confidence_level = Column(Float)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product")


# Trend modeli
class MarketTrend(Base):
    __tablename__ = "market_trends"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    trend_date = Column(DateTime)
    trend_description = Column(Text)
    impact_level = Column(Float)  # 0-1 arasında etki seviyesi
    created_at = Column(DateTime, default=datetime.utcnow)
    
    category = relationship("Category") 