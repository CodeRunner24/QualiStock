from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.quality_check import QualityCheck, QualityStatus
from ..schemas import QualityCheckCreate, QualityCheckUpdate, QualityCheck as QualityCheckSchema
from ..services.quality_check_service import QualityCheckService

class QualityCheckController:
    def __init__(self):
        self.service = QualityCheckService()
        self.router = APIRouter(
            prefix="/quality-checks",
            tags=["quality-checks"],
            responses={404: {"description": "Not found"}},
        )
        self.setup_routes()
    
    def setup_routes(self):
        @self.router.get("/", response_model=List[QualityCheckSchema])
        def get_all_quality_checks(db: Session = Depends(get_db)):
            return self.service.get_all(db)
        
        @self.router.get("/{id}", response_model=QualityCheckSchema)
        def get_quality_check(id: int, db: Session = Depends(get_db)):
            quality_check = self.service.get_by_id(db, id)
            if quality_check is None:
                raise HTTPException(status_code=404, detail="Kalite kontrolü bulunamadı")
            return quality_check
        
        @self.router.post("/", response_model=QualityCheckSchema, status_code=status.HTTP_201_CREATED)
        def create_quality_check(quality_check: QualityCheckCreate, db: Session = Depends(get_db)):
            return self.service.create(db, quality_check.dict())
        
        @self.router.put("/{id}", response_model=QualityCheckSchema)
        def update_quality_check(id: int, quality_check: QualityCheckUpdate, db: Session = Depends(get_db)):
            updated_quality_check = self.service.update(db, id, quality_check.dict())
            if updated_quality_check is None:
                raise HTTPException(status_code=404, detail="Kalite kontrolü bulunamadı")
            return updated_quality_check
        
        @self.router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
        def delete_quality_check(id: int, db: Session = Depends(get_db)):
            success = self.service.delete(db, id)
            if not success:
                raise HTTPException(status_code=404, detail="Kalite kontrolü bulunamadı")
            return {"ok": True}
        
        @self.router.get("/product/{product_id}", response_model=List[QualityCheckSchema])
        def get_quality_checks_by_product(product_id: int, db: Session = Depends(get_db)):
            return self.service.get_by_product_id(db, product_id)
        
        @self.router.get("/batch/{batch_number}", response_model=List[QualityCheckSchema])
        def get_quality_checks_by_batch(batch_number: str, db: Session = Depends(get_db)):
            return self.service.get_by_batch_number(db, batch_number)
        
        @self.router.get("/status/{status}", response_model=List[QualityCheckSchema])
        def get_quality_checks_by_status(status: QualityStatus, db: Session = Depends(get_db)):
            return self.service.get_by_status(db, status)
        
        @self.router.get("/critical/", response_model=List[QualityCheckSchema])
        def get_critical_quality_issues(db: Session = Depends(get_db)):
            return self.service.get_critical_items(db)
        
        @self.router.get("/statistics/", response_model=dict)
        def get_quality_statistics(db: Session = Depends(get_db)):
            return self.service.get_quality_statistics(db) 