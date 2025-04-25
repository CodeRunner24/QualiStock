from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..repositories.quality_check_repository import QualityCheckRepository
from ..models.quality_check import QualityCheck, QualityStatus

class QualityCheckService:
    def __init__(self):
        self.repository = QualityCheckRepository()
    
    def get_all(self, db: Session) -> List[QualityCheck]:
        return self.repository.get_all(db)
    
    def get_by_id(self, db: Session, id: int) -> Optional[QualityCheck]:
        return self.repository.get_by_id(db, id)
    
    def create(self, db: Session, data: Dict[str, Any]) -> QualityCheck:
        return self.repository.create(db, data)
    
    def update(self, db: Session, id: int, data: Dict[str, Any]) -> Optional[QualityCheck]:
        return self.repository.update(db, id, data)
    
    def delete(self, db: Session, id: int) -> bool:
        return self.repository.delete(db, id)
    
    def get_by_product_id(self, db: Session, product_id: int) -> List[QualityCheck]:
        return self.repository.get_by_product_id(db, product_id)
    
    def get_by_batch_number(self, db: Session, batch_number: str) -> List[QualityCheck]:
        return self.repository.get_by_batch_number(db, batch_number)
    
    def get_by_status(self, db: Session, status: QualityStatus) -> List[QualityCheck]:
        return self.repository.get_by_status(db, status)
    
    def get_critical_items(self, db: Session) -> List[QualityCheck]:
        return self.repository.get_by_status(db, QualityStatus.CRITICAL)
    
    def get_quality_statistics(self, db: Session) -> Dict[str, int]:
        all_checks = self.repository.get_all(db)
        stats = {status.value: 0 for status in QualityStatus}
        
        for check in all_checks:
            stats[check.status.value] += 1
            
        return stats 