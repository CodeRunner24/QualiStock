from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..repositories.forecast_repository import ForecastRepository
from ..models.forecast import Forecast

class ForecastService:
    def __init__(self):
        self.repository = ForecastRepository()
    
    def get_all(self, db: Session) -> List[Forecast]:
        return self.repository.get_all(db)
    
    def get_by_id(self, db: Session, id: int) -> Optional[Forecast]:
        return self.repository.get_by_id(db, id)
    
    def create(self, db: Session, data: Dict[str, Any]) -> Forecast:
        return self.repository.create(db, data)
    
    def update(self, db: Session, id: int, data: Dict[str, Any]) -> Optional[Forecast]:
        return self.repository.update(db, id, data)
    
    def delete(self, db: Session, id: int) -> bool:
        return self.repository.delete(db, id)
    
    def get_by_product_id(self, db: Session, product_id: int) -> List[Forecast]:
        return self.repository.get_by_product_id(db, product_id)
    
    def get_by_date_range(self, db: Session, start_date: datetime, end_date: datetime) -> List[Forecast]:
        return self.repository.get_by_date_range(db, start_date, end_date)
    
    def get_future_forecasts(self, db: Session, days_ahead: int = 30) -> List[Forecast]:
        now = datetime.utcnow()
        future_date = now + timedelta(days=days_ahead)
        return self.repository.get_by_date_range(db, now, future_date)
    
    def get_monthly_forecast(self, db: Session) -> Dict[str, List[Forecast]]:
        """Aylık bazda tahminleri gruplandırır"""
        forecasts = self.repository.get_future_forecasts(db)
        monthly_forecasts = {}
        
        for forecast in forecasts:
            month_key = forecast.forecast_date.strftime("%Y-%m")
            if month_key not in monthly_forecasts:
                monthly_forecasts[month_key] = []
            monthly_forecasts[month_key].append(forecast)
            
        return monthly_forecasts 