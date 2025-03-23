from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/forecasting",
    tags=["forecasting"],
    dependencies=[Depends(auth.get_current_active_user)],
    responses={404: {"description": "Not found"}},
)

@router.post("/predictions/", response_model=schemas.Forecast)
async def create_forecast(forecast: schemas.ForecastCreate, db: Session = Depends(get_db)):
    """
    Yeni bir talep tahmini oluşturur.
    """
    # Ürünün var olup olmadığını kontrol et
    product = db.query(models.Product).filter(models.Product.id == forecast.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {forecast.product_id} not found"
        )
    
    # Yeni tahmin oluştur
    db_forecast = models.Forecast(**forecast.dict())
    db.add(db_forecast)
    db.commit()
    db.refresh(db_forecast)
    return db_forecast

@router.get("/predictions/", response_model=List[schemas.Forecast])
async def read_forecasts(
    skip: int = 0, 
    limit: int = 100, 
    product_id: Optional[int] = None,
    min_confidence: Optional[float] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    Talep tahminlerini listeler. Filtreleme parametreleri kullanılabilir.
    """
    query = db.query(models.Forecast)
    
    # Filtreleme
    if product_id:
        query = query.filter(models.Forecast.product_id == product_id)
    if min_confidence is not None:
        query = query.filter(models.Forecast.confidence_level >= min_confidence)
    if start_date:
        query = query.filter(models.Forecast.forecast_date >= start_date)
    if end_date:
        query = query.filter(models.Forecast.forecast_date <= end_date)
    
    # Tahmin tarihine göre sırala
    query = query.order_by(models.Forecast.forecast_date)
    
    forecasts = query.offset(skip).limit(limit).all()
    return forecasts

@router.get("/predictions/{forecast_id}", response_model=schemas.Forecast)
async def read_forecast(forecast_id: int, db: Session = Depends(get_db)):
    """
    ID'ye göre tek bir talep tahmini döndürür.
    """
    db_forecast = db.query(models.Forecast).filter(models.Forecast.id == forecast_id).first()
    if db_forecast is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Forecast with id {forecast_id} not found"
        )
    return db_forecast

@router.put("/predictions/{forecast_id}", response_model=schemas.Forecast)
async def update_forecast(forecast_id: int, forecast: schemas.ForecastCreate, db: Session = Depends(get_db)):
    """
    Talep tahminini günceller.
    """
    db_forecast = db.query(models.Forecast).filter(models.Forecast.id == forecast_id).first()
    if db_forecast is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Forecast with id {forecast_id} not found"
        )
    
    # Ürünün var olup olmadığını kontrol et
    if not db.query(models.Product).filter(models.Product.id == forecast.product_id).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {forecast.product_id} not found"
        )
    
    # Tahmin güncelle
    for key, value in forecast.dict().items():
        setattr(db_forecast, key, value)
    
    db.commit()
    db.refresh(db_forecast)
    return db_forecast

@router.delete("/predictions/{forecast_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_forecast(forecast_id: int, db: Session = Depends(get_db)):
    """
    Talep tahminini siler.
    """
    db_forecast = db.query(models.Forecast).filter(models.Forecast.id == forecast_id).first()
    if db_forecast is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Forecast with id {forecast_id} not found"
        )
    
    db.delete(db_forecast)
    db.commit()
    return None

@router.post("/trends/", response_model=schemas.MarketTrend)
async def create_market_trend(trend: schemas.MarketTrendCreate, db: Session = Depends(get_db)):
    """
    Yeni bir piyasa trendi oluşturur.
    """
    # Kategorinin var olup olmadığını kontrol et
    category = db.query(models.Category).filter(models.Category.id == trend.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {trend.category_id} not found"
        )
    
    # Yeni trend oluştur
    db_trend = models.MarketTrend(**trend.dict())
    db.add(db_trend)
    db.commit()
    db.refresh(db_trend)
    return db_trend

@router.get("/trends/", response_model=List[schemas.MarketTrend])
async def read_market_trends(
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = None,
    min_impact: Optional[float] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    Piyasa trendlerini listeler. Filtreleme parametreleri kullanılabilir.
    """
    query = db.query(models.MarketTrend)
    
    # Filtreleme
    if category_id:
        query = query.filter(models.MarketTrend.category_id == category_id)
    if min_impact is not None:
        query = query.filter(models.MarketTrend.impact_level >= min_impact)
    if start_date:
        query = query.filter(models.MarketTrend.trend_date >= start_date)
    if end_date:
        query = query.filter(models.MarketTrend.trend_date <= end_date)
    
    # Trend tarihine göre sırala (en yeni üstte)
    query = query.order_by(models.MarketTrend.trend_date.desc())
    
    trends = query.offset(skip).limit(limit).all()
    return trends

@router.get("/stats/top-products", response_model=List[dict])
async def get_top_demand_products(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    En yüksek talep tahminine sahip ürünleri döndürür.
    """
    # Ürün bazında toplam talep tahminlerini hesapla
    products = db.query(models.Product).all()
    product_demands = []
    
    for product in products:
        # Ürün için gelecekteki tüm talep tahminlerini topla
        future_date = datetime.utcnow()
        total_demand = db.query(models.Forecast).filter(
            models.Forecast.product_id == product.id,
            models.Forecast.forecast_date >= future_date
        ).with_entities(
            db.func.sum(models.Forecast.predicted_demand).label("total_demand")
        ).scalar() or 0
        
        # Mevcut stok miktarını al
        current_stock = db.query(db.func.sum(models.StockItem.quantity)).filter(
            models.StockItem.product_id == product.id
        ).scalar() or 0
        
        # Ortalama güven düzeyini hesapla
        avg_confidence = db.query(db.func.avg(models.Forecast.confidence_level)).filter(
            models.Forecast.product_id == product.id,
            models.Forecast.forecast_date >= future_date
        ).scalar() or 0
        
        product_demands.append({
            "product_id": product.id,
            "product_name": product.name,
            "category_id": product.category_id,
            "sku": product.sku,
            "total_predicted_demand": total_demand,
            "current_stock": current_stock,
            "stock_difference": current_stock - total_demand,
            "avg_confidence": float(avg_confidence)
        })
    
    # Toplam talep tahmine göre azalan sıralama
    product_demands.sort(key=lambda x: x["total_predicted_demand"], reverse=True)
    
    return product_demands[:limit] 