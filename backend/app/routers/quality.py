from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db
from datetime import datetime

router = APIRouter(
    prefix="/quality",
    tags=["quality"],
    dependencies=[Depends(auth.get_current_active_user)],
    responses={404: {"description": "Not found"}},
)

@router.post("/checks/", response_model=schemas.QualityCheck)
async def create_quality_check(
    check: schemas.QualityCheckCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """
    Yeni bir kalite kontrolü oluşturur.
    """
    # Ürünün var olup olmadığını kontrol et
    product = db.query(models.Product).filter(models.Product.id == check.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {check.product_id} not found"
        )
    
    # Kullanıcının var olup olmadığını kontrol et
    if not db.query(models.User).filter(models.User.id == check.checked_by).first():
        # Eğer belirtilen kullanıcı bulunamazsa, geçerli kullanıcıyı kullan
        check.checked_by = current_user.id
    
    # Yeni kalite kontrolü oluştur
    db_check = models.QualityCheck(**check.dict())
    db.add(db_check)
    db.commit()
    db.refresh(db_check)
    return db_check

@router.get("/checks/", response_model=List[schemas.QualityCheck])
async def read_quality_checks(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[models.QualityStatus] = None,
    product_id: Optional[int] = None,
    batch_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Kalite kontrollerini listeler. Filtreleme parametreleri kullanılabilir.
    """
    query = db.query(models.QualityCheck)
    
    # Filtreleme
    if status:
        query = query.filter(models.QualityCheck.status == status)
    if product_id:
        query = query.filter(models.QualityCheck.product_id == product_id)
    if batch_number:
        query = query.filter(models.QualityCheck.batch_number.contains(batch_number))
    
    checks = query.order_by(models.QualityCheck.check_date.desc()).offset(skip).limit(limit).all()
    return checks

@router.get("/checks/{check_id}", response_model=schemas.QualityCheck)
async def read_quality_check(check_id: int, db: Session = Depends(get_db)):
    """
    ID'ye göre tek bir kalite kontrolü döndürür.
    """
    db_check = db.query(models.QualityCheck).filter(models.QualityCheck.id == check_id).first()
    if db_check is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quality check with id {check_id} not found"
        )
    return db_check

@router.put("/checks/{check_id}", response_model=schemas.QualityCheck)
async def update_quality_check(
    check_id: int, 
    check: schemas.QualityCheckCreate, 
    db: Session = Depends(get_db)
):
    """
    Kalite kontrolünü günceller.
    """
    db_check = db.query(models.QualityCheck).filter(models.QualityCheck.id == check_id).first()
    if db_check is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quality check with id {check_id} not found"
        )
    
    # Ürünün var olup olmadığını kontrol et
    if not db.query(models.Product).filter(models.Product.id == check.product_id).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {check.product_id} not found"
        )
    
    # Kullanıcının var olup olmadığını kontrol et
    if not db.query(models.User).filter(models.User.id == check.checked_by).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {check.checked_by} not found"
        )
    
    # Kalite kontrolünü güncelle
    for key, value in check.dict().items():
        setattr(db_check, key, value)
    
    db.commit()
    db.refresh(db_check)
    return db_check

@router.delete("/checks/{check_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quality_check(check_id: int, db: Session = Depends(get_db)):
    """
    Kalite kontrolünü siler.
    """
    db_check = db.query(models.QualityCheck).filter(models.QualityCheck.id == check_id).first()
    if db_check is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quality check with id {check_id} not found"
        )
    
    db.delete(db_check)
    db.commit()
    return None

@router.get("/stats/by-status", response_model=dict)
async def get_quality_stats_by_status(db: Session = Depends(get_db)):
    """
    Kalite kontrol istatistiklerini duruma göre gruplandırılmış şekilde döndürür.
    """
    result = {}
    for status in models.QualityStatus:
        count = db.query(models.QualityCheck).filter(models.QualityCheck.status == status).count()
        result[status.value] = count
    
    return result

@router.get("/stats/issues-by-product", response_model=List[dict])
async def get_quality_issues_by_product(db: Session = Depends(get_db)):
    """
    Ürün bazında kalite sorunlarını döndürür (POOR ve CRITICAL durumlar).
    """
    issues = []
    products = db.query(models.Product).all()
    
    for product in products:
        critical_count = db.query(models.QualityCheck).filter(
            models.QualityCheck.product_id == product.id,
            models.QualityCheck.status == models.QualityStatus.CRITICAL
        ).count()
        
        poor_count = db.query(models.QualityCheck).filter(
            models.QualityCheck.product_id == product.id,
            models.QualityCheck.status == models.QualityStatus.POOR
        ).count()
        
        if critical_count > 0 or poor_count > 0:
            issues.append({
                "product_id": product.id,
                "product_name": product.name,
                "critical_issues": critical_count,
                "poor_issues": poor_count,
                "total_issues": critical_count + poor_count
            })
    
    # Toplam sorun sayısına göre azalan sıralama
    issues.sort(key=lambda x: x["total_issues"], reverse=True)
    return issues[:10]  # En çok sorun olan 10 ürün 