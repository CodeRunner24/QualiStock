from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Dict
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from ..models.forecast import Forecast
from ..schemas import ForecastCreate, ForecastUpdate, Forecast as ForecastSchema
from ..services.forecast_service import ForecastService

class ForecastController:
    def __init__(self):
        self.service = ForecastService()
        self.router = APIRouter(
            prefix="/forecasts",
            tags=["forecasts"],
            responses={404: {"description": "Not found"}},
        )
        self.setup_routes()
    
    def setup_routes(self):
        @self.router.get("/", response_model=List[ForecastSchema])
        def get_all_forecasts(db: Session = Depends(get_db)):
            return self.service.get_all(db)
        
        @self.router.get("/{id}", response_model=ForecastSchema)
        def get_forecast(id: int, db: Session = Depends(get_db)):
            forecast = self.service.get_by_id(db, id)
            if forecast is None:
                raise HTTPException(status_code=404, detail="Talep tahmini bulunamadı")
            return forecast
        
        @self.router.post("/", response_model=ForecastSchema, status_code=status.HTTP_201_CREATED)
        def create_forecast(forecast: ForecastCreate, db: Session = Depends(get_db)):
            return self.service.create(db, forecast.dict())
        
        @self.router.put("/{id}", response_model=ForecastSchema)
        def update_forecast(id: int, forecast: ForecastUpdate, db: Session = Depends(get_db)):
            updated_forecast = self.service.update(db, id, forecast.dict())
            if updated_forecast is None:
                raise HTTPException(status_code=404, detail="Talep tahmini bulunamadı")
            return updated_forecast
        
        @self.router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
        def delete_forecast(id: int, db: Session = Depends(get_db)):
            success = self.service.delete(db, id)
            if not success:
                raise HTTPException(status_code=404, detail="Talep tahmini bulunamadı")
            return {"ok": True}
        
        @self.router.get("/product/{product_id}", response_model=List[ForecastSchema])
        def get_forecasts_by_product(product_id: int, db: Session = Depends(get_db)):
            return self.service.get_by_product_id(db, product_id)
        
        @self.router.get("/future/{days}", response_model=List[ForecastSchema])
        def get_future_forecasts(days: int = 30, db: Session = Depends(get_db)):
            return self.service.get_future_forecasts(db, days)
        
        @self.router.get("/date-range/", response_model=List[ForecastSchema])
        def get_forecasts_by_date_range(
            start_date: datetime = Query(...),
            end_date: datetime = Query(...),
            db: Session = Depends(get_db)
        ):
            return self.service.get_by_date_range(db, start_date, end_date)
        
        @self.router.get("/monthly/", response_model=Dict[str, List[ForecastSchema]])
        def get_monthly_forecasts(db: Session = Depends(get_db)):
            return self.service.get_monthly_forecast(db) 