from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from .. import models, schemas, auth
from ..database import get_db
from typing import List

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(auth.get_current_active_user)],
    responses={404: {"description": "Not found"}},
)

@router.get("/stats", response_model=schemas.DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Dashboard sayfası için temel istatistikleri almak için kullanılır.
    """
    # Toplam ürün sayısı
    total_products = db.query(func.count(models.Product.id)).scalar()
    
    # Toplam stok öğesi sayısı
    total_stock_items = db.query(func.count(models.StockItem.id)).scalar()
    
    # Kalite sorunları olan öğe sayısı
    quality_issues = db.query(func.count(models.QualityCheck.id)).filter(
        models.QualityCheck.status.in_([models.QualityStatus.POOR, models.QualityStatus.CRITICAL])
    ).scalar()
    
    # 30 gün içinde son kullanma tarihi yaklaşan öğe sayısı
    thirty_days_later = datetime.utcnow() + timedelta(days=30)
    expiring_soon = db.query(func.count(models.StockItem.id)).filter(
        models.StockItem.expiration_date <= thirty_days_later,
        models.StockItem.expiration_date >= datetime.utcnow()
    ).scalar()
    
    # Düşük stoklu öğe sayısı (örnek olarak, miktarı 10'dan az olan)
    low_stock_threshold = 10
    low_stock_items = db.query(func.count(models.StockItem.id)).filter(
        models.StockItem.quantity < low_stock_threshold
    ).scalar()
    
    return {
        "total_products": total_products,
        "total_stock_items": total_stock_items,
        "quality_issues": quality_issues,
        "expiring_soon": expiring_soon,
        "low_stock_items": low_stock_items
    }

@router.get("/quality-issues", response_model=List[schemas.QualityCheck])
async def get_quality_issues(db: Session = Depends(get_db)):
    """
    Dashboard için kalite sorunları olan öğeleri almak için kullanılır.
    """
    issues = db.query(models.QualityCheck).filter(
        models.QualityCheck.status.in_([models.QualityStatus.POOR, models.QualityStatus.CRITICAL])
    ).order_by(models.QualityCheck.check_date.desc()).limit(10).all()
    
    return issues

@router.get("/expiring-soon", response_model=List[schemas.StockItem])
async def get_expiring_soon(db: Session = Depends(get_db)):
    """
    Dashboard için yakında süresi dolacak öğeleri almak için kullanılır.
    """
    thirty_days_later = datetime.utcnow() + timedelta(days=30)
    items = db.query(models.StockItem).filter(
        models.StockItem.expiration_date <= thirty_days_later,
        models.StockItem.expiration_date >= datetime.utcnow()
    ).order_by(models.StockItem.expiration_date).limit(10).all()
    
    return items

@router.get("/low-stock", response_model=List[schemas.StockItem])
async def get_low_stock(db: Session = Depends(get_db)):
    """
    Dashboard için düşük stoklu öğeleri almak için kullanılır.
    """
    low_stock_threshold = 10
    items = db.query(models.StockItem).filter(
        models.StockItem.quantity < low_stock_threshold
    ).order_by(models.StockItem.quantity).limit(10).all()
    
    return items 