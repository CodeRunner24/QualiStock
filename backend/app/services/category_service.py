from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.category_repository import CategoryRepository
from ..models import Category, Product
from ..schemas import CategoryCreate, CategoryUpdate, Category as CategorySchema

class CategoryService:
    def __init__(self):
        self.repository = CategoryRepository()
    
    def create_category(self, db: Session, category: CategoryCreate) -> Category:
        """Yeni kategori oluşturur"""
        # Aynı isimde kategori var mı kontrol et
        existing = self.repository.get_by_name(db, category.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with name '{category.name}' already exists"
            )
        
        return self.repository.create(db, obj_in=category)
    
    def get_categories(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        name: Optional[str] = None
    ) -> List[Category]:
        """Kategorileri listeler, isteğe bağlı isim filtrelemesi yapar"""
        filter_condition = None
        if name:
            filter_condition = Category.name.contains(name)
        
        return self.repository.get_all(db, skip=skip, limit=limit, filter_condition=filter_condition)
    
    def get_category(self, db: Session, category_id: int) -> Category:
        """ID'ye göre kategori döndürür"""
        category = self.repository.get(db, category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with id {category_id} not found"
            )
        return category
    
    def update_category(self, db: Session, category_id: int, category: CategoryUpdate) -> Category:
        """Kategoriyi günceller"""
        db_category = self.get_category(db, category_id)
        
        # Farklı bir kategori aynı isme sahip mi kontrol et
        if category.name != db_category.name:
            existing = self.repository.get_with_name_except_id(db, category.name, category_id)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category with name '{category.name}' already exists"
                )
        
        return self.repository.update(db, db_obj=db_category, obj_in=category)
    
    def delete_category(self, db: Session, category_id: int) -> None:
        """Kategoriyi siler"""
        db_category = self.get_category(db, category_id)
        
        # Kategoriye bağlı ürünler var mı kontrol et
        products_count = self.repository.count_products(db, category_id)
        if products_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete category that has {products_count} products. Remove products first."
            )
        
        self.repository.delete(db, id=category_id)
    
    def get_category_products(
        self, 
        db: Session, 
        category_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Product]:
        """Belirli bir kategoriye ait ürünleri listeler"""
        # Kategorinin var olup olmadığını kontrol et
        self.get_category(db, category_id)
        
        # Kategoriye ait ürünleri getir
        return self.repository.get_products(db, category_id, skip, limit) 