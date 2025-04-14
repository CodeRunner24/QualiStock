from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..auth import get_current_active_user
from ..services.stock_item_service import StockItemService
from ..schemas import StockItem, StockItemCreate, StockItemUpdate

class StockItemController:
    def __init__(self):
        self.service = StockItemService()
        self.router = APIRouter(
            prefix="/stock-items",
            tags=["stock-items"],
            dependencies=[Depends(get_current_active_user)],
            responses={404: {"description": "Not found"}},
        )
        self._register_routes()
    
    def _register_routes(self):
        @self.router.post("/", response_model=StockItem)
        async def create_stock_item(stock_item: StockItemCreate, db: Session = Depends(get_db)):
            """Yeni bir stok öğesi oluşturur."""
            return self.service.create_stock_item(db, stock_item)
        
        @self.router.get("/", response_model=List[StockItem])
        async def read_stock_items(
            skip: int = 0, 
            limit: int = 100, 
            product_id: Optional[int] = None,
            location: Optional[str] = None,
            low_stock: bool = False,
            expiring_soon: bool = False,
            db: Session = Depends(get_db)
        ):
            """Stok öğelerini listeler. Çeşitli filtreleme seçenekleri sunar."""
            return self.service.get_stock_items(
                db, skip, limit, product_id, location, low_stock, expiring_soon
            )
        
        @self.router.get("/{stock_item_id}", response_model=StockItem)
        async def read_stock_item(stock_item_id: int, db: Session = Depends(get_db)):
            """ID'ye göre tek bir stok öğesi döndürür."""
            return self.service.get_stock_item(db, stock_item_id)
        
        @self.router.put("/{stock_item_id}", response_model=StockItem)
        async def update_stock_item(stock_item_id: int, stock_item: StockItemUpdate, db: Session = Depends(get_db)):
            """Stok öğesini günceller."""
            return self.service.update_stock_item(db, stock_item_id, stock_item)
        
        @self.router.delete("/{stock_item_id}", status_code=status.HTTP_204_NO_CONTENT)
        async def delete_stock_item(stock_item_id: int, db: Session = Depends(get_db)):
            """Stok öğesini siler."""
            self.service.delete_stock_item(db, stock_item_id)
            return None
        
        @self.router.get("/analytics/expiring-soon-count")
        async def get_expiring_soon_count(days: int = 30, db: Session = Depends(get_db)):
            """Yakında sona erecek stok öğelerinin sayısını döndürür."""
            return {"count": self.service.get_expiring_soon_count(db, days)}
        
        @self.router.get("/analytics/low-stock-count")
        async def get_low_stock_count(threshold: int = 10, db: Session = Depends(get_db)):
            """Düşük stok miktarına sahip öğelerin sayısını döndürür."""
            return {"count": self.service.get_low_stock_count(db, threshold)} 