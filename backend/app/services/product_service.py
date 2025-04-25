from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.product_repository import ProductRepository
from ..repositories.category_repository import CategoryRepository
from ..models import Product, StockItem
from ..schemas import ProductCreate, ProductUpdate

class ProductService:
    def __init__(self):
        self.repository = ProductRepository()
        self.category_repository = CategoryRepository()
    
    def create_product(self, db: Session, product: ProductCreate) -> Product:
        """Yeni ürün oluşturur"""
        # Kategorinin var olup olmadığını kontrol et
        category = self.category_repository.get_by_id(db, product.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with id {product.category_id} not found"
            )
        
        # Aynı SKU'da ürün var mı kontrol et
        existing = self.repository.get_by_sku(db, product.sku)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product.sku}' already exists"
            )
        
        return self.repository.create(db, product.dict())
    
    def get_products(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        category_id: Optional[int] = None,
        name: Optional[str] = None
    ) -> List[Product]:
        """Ürünleri listeler, isteğe bağlı kategori ve isim filtrelemesi yapar"""
        filter_condition = None
        
        # Filtreler oluştur
        conditions = []
        
        if category_id:
            conditions.append(Product.category_id == category_id)
        
        if name:
            conditions.append(Product.name.contains(name))
        
        # Koşulları birleştir
        if conditions:
            from sqlalchemy import and_
            filter_condition = and_(*conditions)
        
        return self.repository.get_all(db, skip=skip, limit=limit, filter_condition=filter_condition)
    
    def get_product(self, db: Session, product_id: int) -> Product:
        """ID'ye göre ürün döndürür"""
        product = self.repository.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found"
            )
        return product
    
    def update_product(self, db: Session, product_id: int, product: ProductUpdate) -> Product:
        """Ürünü günceller"""
        db_product = self.get_product(db, product_id)
        
        # Kategorinin var olup olmadığını kontrol et
        if product.category_id != db_product.category_id:
            category = self.category_repository.get_by_id(db, product.category_id)
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category with id {product.category_id} not found"
                )
        
        # Farklı bir ürün aynı SKU'ya sahip mi kontrol et
        if product.sku != db_product.sku:
            existing = self.repository.get_with_sku_except_id(db, product.sku, product_id)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product with SKU '{product.sku}' already exists"
                )
        
        return self.repository.update(db, product_id, product.dict())
    
    def delete_product(self, db: Session, product_id: int) -> None:
        """Ürünü siler"""
        db_product = self.get_product(db, product_id)
        
        # Ürüne bağlı stok öğelerini kontrol et
        stock_items = self.repository.get_stock_items(db, product_id)
        if stock_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete product that has {len(stock_items)} stock items. Remove stock items first."
            )
        
        self.repository.delete(db, product_id)
    
    def get_product_stock_items(
        self, 
        db: Session, 
        product_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[StockItem]:
        """Belirli bir ürüne ait stok öğelerini listeler"""
        # Ürünün var olup olmadığını kontrol et
        self.get_product(db, product_id)
        
        # Ürüne ait stok öğelerini getir
        return self.repository.get_stock_items(db, product_id, skip, limit) 