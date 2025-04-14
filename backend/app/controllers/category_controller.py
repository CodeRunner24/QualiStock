from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..auth import get_current_active_user
from ..services.category_service import CategoryService
from ..schemas import Category, CategoryCreate, CategoryUpdate, Product

class CategoryController:
    def __init__(self):
        self.service = CategoryService()
        self.router = APIRouter(
            prefix="/categories",
            tags=["categories"],
            dependencies=[Depends(get_current_active_user)],
            responses={404: {"description": "Not found"}},
        )
        self._register_routes()
    
    def _register_routes(self):
        @self.router.post("/", response_model=Category)
        async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
            """Yeni bir kategori oluşturur."""
            return self.service.create_category(db, category)
        
        @self.router.get("/", response_model=List[Category])
        async def read_categories(
            skip: int = 0, 
            limit: int = 100, 
            name: Optional[str] = None,
            db: Session = Depends(get_db)
        ):
            """Kategorileri listeler. İsme göre filtreleme yapılabilir."""
            return self.service.get_categories(db, skip, limit, name)
        
        @self.router.get("/{category_id}", response_model=Category)
        async def read_category(category_id: int, db: Session = Depends(get_db)):
            """ID'ye göre tek bir kategori döndürür."""
            return self.service.get_category(db, category_id)
        
        @self.router.put("/{category_id}", response_model=Category)
        async def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
            """Kategoriyi günceller."""
            return self.service.update_category(db, category_id, category)
        
        @self.router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
        async def delete_category(category_id: int, db: Session = Depends(get_db)):
            """Kategoriyi siler."""
            self.service.delete_category(db, category_id)
            return None
        
        @self.router.get("/{category_id}/products", response_model=List[Product])
        async def read_category_products(
            category_id: int, 
            skip: int = 0, 
            limit: int = 100,
            db: Session = Depends(get_db)
        ):
            """Belirli bir kategoriye ait ürünleri listeler."""
            return self.service.get_category_products(db, category_id, skip, limit) 