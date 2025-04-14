from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.stock_item_repository import StockItemRepository
from ..repositories.product_repository import ProductRepository
from ..models import StockItem
from ..schemas import StockItemCreate, StockItemUpdate

class StockItemService:
    def __init__(self):
        self.repository = StockItemRepository()
        self.product_repository = ProductRepository()
    
    def create_stock_item(self, db: Session, stock_item: StockItemCreate) -> StockItem:
        """Yeni stok öğesi oluşturur"""
        # Ürünün var olup olmadığını kontrol et
        product = self.product_repository.get(db, stock_item.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {stock_item.product_id} not found"
            )
        
        return self.repository.create(db, obj_in=stock_item)
    
    def get_stock_items(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        product_id: Optional[int] = None,
        location: Optional[str] = None,
        low_stock: bool = False,
        expiring_soon: bool = False
    ) -> List[StockItem]:
        """Stok öğelerini listeler, çeşitli filtreleme seçenekleri ile"""
        if product_id:
            return self.repository.get_by_product_id(db, product_id, skip, limit)
        elif location:
            return self.repository.get_by_location(db, location, skip, limit)
        elif low_stock:
            return self.repository.get_low_stock_items(db, 10, skip, limit)
        elif expiring_soon:
            return self.repository.get_expiring_soon(db, 30, skip, limit)
        else:
            return self.repository.get_all(db, skip=skip, limit=limit)
    
    def get_stock_item(self, db: Session, stock_item_id: int) -> StockItem:
        """ID'ye göre stok öğesi döndürür"""
        stock_item = self.repository.get(db, stock_item_id)
        if not stock_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stock item with id {stock_item_id} not found"
            )
        return stock_item
    
    def update_stock_item(self, db: Session, stock_item_id: int, stock_item: StockItemUpdate) -> StockItem:
        """Stok öğesini günceller"""
        db_stock_item = self.get_stock_item(db, stock_item_id)
        
        # Eğer ürün ID'si değiştiriliyorsa, yeni ürünün var olup olmadığını kontrol et
        if stock_item.product_id != db_stock_item.product_id:
            product = self.product_repository.get(db, stock_item.product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with id {stock_item.product_id} not found"
                )
        
        return self.repository.update(db, db_obj=db_stock_item, obj_in=stock_item)
    
    def delete_stock_item(self, db: Session, stock_item_id: int) -> None:
        """Stok öğesini siler"""
        db_stock_item = self.get_stock_item(db, stock_item_id)
        self.repository.delete(db, id=stock_item_id)
    
    def get_expiring_soon_count(self, db: Session, days: int = 30) -> int:
        """Yakında sona erecek stok öğelerinin sayısını döndürür"""
        return self.repository.count_expiring_soon(db, days)
    
    def get_low_stock_count(self, db: Session, threshold: int = 10) -> int:
        """Düşük stok miktarına sahip öğelerin sayısını döndürür"""
        return self.repository.count_low_stock_items(db, threshold) 