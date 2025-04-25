from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models import Category, Product
from ..schemas import CategoryCreate, CategoryUpdate
from .base_repository import BaseRepository

class CategoryRepository(BaseRepository[Category]):
    def __init__(self):
        super().__init__(Category)
        
    def get_by_name(self, db: Session, name: str) -> Optional[Category]:
        """İsme göre kategori arar"""
        return db.query(Category).filter(Category.name == name).first()
    
    def get_with_name_except_id(self, db: Session, name: str, category_id: int) -> Optional[Category]:
        """Belirli bir ID dışında, isimle eşleşen kategori arar"""
        return db.query(Category).filter(
            and_(
                Category.name == name,
                Category.id != category_id
            )
        ).first()
    
    def get_products(self, db: Session, category_id: int, skip: int = 0, limit: int = 100) -> List[Product]:
        """Kategoriye ait ürünleri listeler"""
        return db.query(Product).filter(
            Product.category_id == category_id
        ).offset(skip).limit(limit).all()
    
    def count_products(self, db: Session, category_id: int) -> int:
        """Kategoriye ait ürünlerin sayısını döndürür"""
        return db.query(Product).filter(Product.category_id == category_id).count() 