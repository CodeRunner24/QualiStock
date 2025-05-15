from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, timedelta

from ..models import StockItem
from ..schemas import StockItemCreate, StockItemUpdate
from .base_repository import BaseRepository

class StockItemRepository(BaseRepository[StockItem]):
    def __init__(self):
        super().__init__(StockItem)
    
    def get_by_batch_number(self, db: Session, batch_number: str) -> Optional[StockItem]:
        """Parti numarasına göre stok öğesi arar"""
        return db.query(StockItem).filter(StockItem.batch_number == batch_number).first()
    
    def get_by_product_id(self, db: Session, product_id: int, skip: int = 0, limit: int = 100) -> List[StockItem]:
        """Ürün ID'sine göre stok öğelerini listeler"""
        return db.query(StockItem).filter(StockItem.product_id == product_id).offset(skip).limit(limit).all()
    
    def find_by_product_id(self, db: Session, product_id: int) -> Optional[StockItem]:
        """Ürün ID'sine göre ilk stok öğesini döndürür"""
        return db.query(StockItem).filter(StockItem.product_id == product_id).first()
    
    def get_by_location(self, db: Session, location: str, skip: int = 0, limit: int = 100) -> List[StockItem]:
        """Lokasyona göre stok öğelerini listeler"""
        return db.query(StockItem).filter(StockItem.location == location).offset(skip).limit(limit).all()
    
    def get_expiring_soon(self, db: Session, days: int = 30, skip: int = 0, limit: int = 100) -> List[StockItem]:
        """Yakında sona erecek stok öğelerini listeler"""
        expiry_date = datetime.utcnow() + timedelta(days=days)
        return db.query(StockItem).filter(
            and_(
                StockItem.expiration_date.isnot(None),
                StockItem.expiration_date <= expiry_date
            )
        ).offset(skip).limit(limit).all()
    
    def get_low_stock_items(self, db: Session, threshold: int = 10, skip: int = 0, limit: int = 100) -> List[StockItem]:
        """Düşük stok miktarına sahip öğeleri listeler"""
        return db.query(StockItem).filter(StockItem.quantity <= threshold).offset(skip).limit(limit).all()
    
    def count_expiring_soon(self, db: Session, days: int = 30) -> int:
        """Yakında sona erecek stok öğelerinin sayısını döndürür"""
        expiry_date = datetime.utcnow() + timedelta(days=days)
        return db.query(func.count(StockItem.id)).filter(
            and_(
                StockItem.expiration_date.isnot(None),
                StockItem.expiration_date <= expiry_date
            )
        ).scalar()
    
    def count_low_stock_items(self, db: Session, threshold: int = 10) -> int:
        """Düşük stok miktarına sahip öğelerin sayısını döndürür"""
        return db.query(func.count(StockItem.id)).filter(StockItem.quantity <= threshold).scalar() 