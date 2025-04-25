from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models import Product, StockItem
from ..schemas import ProductCreate, ProductUpdate
from .base_repository import BaseRepository

class ProductRepository(BaseRepository[Product]):
    def __init__(self):
        super().__init__(Product)
        
    def get_by_sku(self, db: Session, sku: str) -> Optional[Product]:
        """SKU'ya göre ürün arar"""
        return db.query(Product).filter(Product.sku == sku).first()
    
    def get_with_sku_except_id(self, db: Session, sku: str, product_id: int) -> Optional[Product]:
        """Belirli bir ID dışında, SKU ile eşleşen ürün arar"""
        return db.query(Product).filter(
            and_(
                Product.sku == sku,
                Product.id != product_id
            )
        ).first()
    
    def get_products_by_category(self, db: Session, category_id: int, skip: int = 0, limit: int = 100) -> List[Product]:
        """Kategoriye göre ürünleri listeler"""
        return db.query(Product).filter(
            Product.category_id == category_id
        ).offset(skip).limit(limit).all()
    
    def get_stock_items(self, db: Session, product_id: int, skip: int = 0, limit: int = 100) -> List[StockItem]:
        """Ürüne ait stok öğelerini listeler"""
        return db.query(StockItem).filter(
            StockItem.product_id == product_id
        ).offset(skip).limit(limit).all() 