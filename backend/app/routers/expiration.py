from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/expiration",
    tags=["expiration"],
    dependencies=[Depends(auth.get_current_active_user)],
    responses={404: {"description": "Not found"}},
)

@router.get("/items/", response_model=List[dict])
async def get_expiring_items(
    skip: int = 0, 
    limit: int = 100, 
    days: Optional[int] = 90,  # Varsayılan olarak 90 gün içinde sona erecek öğeleri getir
    category_id: Optional[int] = None,
    product_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Belirtilen gün sayısı içinde sona erecek stok öğelerini döndürür.
    days parametresi ile kaç gün içinde sona erecek öğelerin getirileceği belirtilebilir.
    """
    # Şu anki tarih
    now = datetime.utcnow()
    # Belirtilen gün sayısı kadar ileri tarih
    end_date = now + timedelta(days=days)
    
    # Son kullanma tarihi yaklaşan stok öğelerini ve ilişkili ürünleri al
    items = db.query(
        models.StockItem.id.label("stock_item_id"),
        models.StockItem.product_id,
        models.StockItem.batch_number,
        models.StockItem.quantity,
        models.StockItem.location,
        models.StockItem.expiration_date,
        models.StockItem.manufacturing_date,
        models.StockItem.created_at,
        models.Product.id.label("product_id"),
        models.Product.name.label("product_name"),
        models.Product.sku,
        models.Product.unit_price,
        models.Category.id.label("category_id"),
        models.Category.name.label("category_name")
    ).join(
        models.Product, models.StockItem.product_id == models.Product.id
    ).join(
        models.Category, models.Product.category_id == models.Category.id
    ).filter(
        models.StockItem.expiration_date.isnot(None),
        models.StockItem.expiration_date >= now,
        models.StockItem.expiration_date <= end_date
    )
    
    # Kategori filtresi
    if category_id:
        items = items.filter(models.Product.category_id == category_id)
    
    # Ürün filtresi
    if product_id:
        items = items.filter(models.StockItem.product_id == product_id)
    
    # Son kullanma tarihine göre sırala (yakın olan önce)
    items = items.order_by(models.StockItem.expiration_date)
    
    # Sayfalama uygula
    items = items.offset(skip).limit(limit).all()
    
    # Kalan gün sayısını ve ek bilgileri ekleyerek sonucu formatla
    result = []
    for item in items:
        # Kalan gün sayısını hesapla
        days_remaining = (item.expiration_date - now).days
        
        result.append({
            "id": item.stock_item_id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "sku": item.sku,
            "category_id": item.category_id,
            "category": item.category_name,
            "batch_number": item.batch_number,
            "quantity": item.quantity,
            "location": item.location,
            "unit_price": item.unit_price,
            "expiration_date": item.expiration_date,
            "manufacturing_date": item.manufacturing_date,
            "created_at": item.created_at,
            "days_remaining": days_remaining
        })
    
    return result

@router.get("/stats", response_model=dict)
async def get_expiration_stats(db: Session = Depends(get_db)):
    """
    Son kullanma tarihi ile ilgili istatistikler döndürür.
    """
    now = datetime.utcnow()
    
    # Toplam son kullanma tarihi yaklaşan öğe sayısı (90 gün içinde)
    ninety_days = now + timedelta(days=90)
    total_expiring = db.query(func.count(models.StockItem.id)).filter(
        models.StockItem.expiration_date.isnot(None),
        models.StockItem.expiration_date >= now,
        models.StockItem.expiration_date <= ninety_days
    ).scalar()
    
    # Kritik son kullanma tarihi yaklaşan öğe sayısı (7 gün içinde)
    seven_days = now + timedelta(days=7)
    critical_expiring = db.query(func.count(models.StockItem.id)).filter(
        models.StockItem.expiration_date.isnot(None),
        models.StockItem.expiration_date >= now,
        models.StockItem.expiration_date <= seven_days
    ).scalar()
    
    # Bu hafta sona erecek öğe sayısı
    today = now.date()
    weekday = today.weekday()
    start_of_week = today - timedelta(days=weekday)
    end_of_week = start_of_week + timedelta(days=6)
    
    this_week_expiring = db.query(func.count(models.StockItem.id)).filter(
        models.StockItem.expiration_date.isnot(None),
        func.date(models.StockItem.expiration_date) >= start_of_week,
        func.date(models.StockItem.expiration_date) <= end_of_week
    ).scalar()
    
    # Kategori bazında sona erecek öğe sayısı
    categories = db.query(models.Category).all()
    by_category = []
    
    for category in categories:
        count = db.query(func.count(models.StockItem.id)).join(
            models.Product, models.StockItem.product_id == models.Product.id
        ).filter(
            models.Product.category_id == category.id,
            models.StockItem.expiration_date.isnot(None),
            models.StockItem.expiration_date >= now,
            models.StockItem.expiration_date <= ninety_days
        ).scalar()
        
        if count > 0:
            by_category.append({
                "category_id": category.id,
                "category_name": category.name,
                "count": count
            })
    
    # Zaman dilimlerine göre sona erecek öğe sayısı
    time_ranges = {
        "0-7_days": db.query(func.count(models.StockItem.id)).filter(
            models.StockItem.expiration_date.isnot(None),
            models.StockItem.expiration_date >= now,
            models.StockItem.expiration_date <= now + timedelta(days=7)
        ).scalar(),
        "8-30_days": db.query(func.count(models.StockItem.id)).filter(
            models.StockItem.expiration_date.isnot(None),
            models.StockItem.expiration_date > now + timedelta(days=7),
            models.StockItem.expiration_date <= now + timedelta(days=30)
        ).scalar(),
        "31-90_days": db.query(func.count(models.StockItem.id)).filter(
            models.StockItem.expiration_date.isnot(None),
            models.StockItem.expiration_date > now + timedelta(days=30),
            models.StockItem.expiration_date <= now + timedelta(days=90)
        ).scalar()
    }
    
    return {
        "total_expiring": total_expiring,
        "critical_expiring": critical_expiring,
        "this_week_expiring": this_week_expiring,
        "by_category": by_category,
        "time_ranges": time_ranges
    }

@router.get("/critical", response_model=List[dict])
async def get_critical_expiring_items(db: Session = Depends(get_db)):
    """
    Son kullanma tarihi kritik olan (7 gün içinde sona erecek) öğeleri ürün bilgileriyle birlikte döndürür.
    """
    now = datetime.utcnow()
    seven_days = now + timedelta(days=7)
    
    # Son kullanma tarihi 7 gün içinde olan stok öğelerini ve ilişkili ürünleri al
    items = db.query(
        models.StockItem.id.label("stock_item_id"),
        models.StockItem.batch_number,
        models.StockItem.quantity,
        models.StockItem.expiration_date,
        models.StockItem.location,
        models.Product.id.label("product_id"),
        models.Product.name.label("product_name"),
        models.Product.sku,
        models.Category.name.label("category_name")
    ).join(
        models.Product, models.StockItem.product_id == models.Product.id
    ).join(
        models.Category, models.Product.category_id == models.Category.id
    ).filter(
        models.StockItem.expiration_date.isnot(None),
        models.StockItem.expiration_date >= now,
        models.StockItem.expiration_date <= seven_days
    ).order_by(models.StockItem.expiration_date).all()
    
    result = []
    for item in items:
        # Kalan gün sayısını hesapla
        days_remaining = (item.expiration_date - now).days
        
        result.append({
            "stock_item_id": item.stock_item_id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "sku": item.sku,
            "category": item.category_name,
            "batch_number": item.batch_number,
            "quantity": item.quantity,
            "location": item.location,
            "expiration_date": item.expiration_date,
            "days_remaining": days_remaining
        })
    
    return result 