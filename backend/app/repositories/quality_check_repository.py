from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.quality_check import QualityCheck
from .base_repository import BaseRepository

class QualityCheckRepository(BaseRepository[QualityCheck]):
    def __init__(self):
        super().__init__(QualityCheck)
    
    def get_by_product_id(self, db: Session, product_id: int) -> List[QualityCheck]:
        return db.query(QualityCheck).filter(QualityCheck.product_id == product_id).all()
    
    def get_by_batch_number(self, db: Session, batch_number: str) -> List[QualityCheck]:
        return db.query(QualityCheck).filter(QualityCheck.batch_number == batch_number).all()
    
    def get_by_status(self, db: Session, status: str) -> List[QualityCheck]:
        return db.query(QualityCheck).filter(QualityCheck.status == status).all() 