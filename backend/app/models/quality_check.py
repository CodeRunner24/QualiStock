from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import Base

class QualityStatus(str, enum.Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    ACCEPTABLE = "ACCEPTABLE"
    POOR = "POOR"
    CRITICAL = "CRITICAL"

class QualityCheck(Base):
    __tablename__ = "quality_checks"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    batch_number = Column(String, index=True)
    check_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(QualityStatus))
    notes = Column(Text, nullable=True)
    checked_by = Column(Integer, ForeignKey("users.id"))
    
    product = relationship("Product", back_populates="quality_checks")
    checker = relationship("User") 