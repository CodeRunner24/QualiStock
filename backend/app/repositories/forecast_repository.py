from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from ..models.forecast import Forecast
from .base_repository import BaseRepository

class ForecastRepository(BaseRepository[Forecast]):
    def __init__(self):
        super().__init__(Forecast)
    
    def get_by_product_id(self, db: Session, product_id: int) -> List[Forecast]:
        return db.query(Forecast).filter(Forecast.product_id == product_id).all()
    
    def get_by_date_range(self, db: Session, start_date: datetime, end_date: datetime) -> List[Forecast]:
        return db.query(Forecast).filter(
            Forecast.forecast_date >= start_date,
            Forecast.forecast_date <= end_date
        ).all()
    
    def get_future_forecasts(self, db: Session, reference_date: Optional[datetime] = None) -> List[Forecast]:
        if reference_date is None:
            reference_date = datetime.utcnow()
        return db.query(Forecast).filter(Forecast.forecast_date >= reference_date).all() 