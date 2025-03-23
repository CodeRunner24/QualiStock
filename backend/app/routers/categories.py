from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
    dependencies=[Depends(auth.get_current_active_user)],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Category)
async def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """
    Yeni bir kategori oluşturur.
    """
    # Aynı isimde kategori var mı kontrol et
    if db.query(models.Category).filter(models.Category.name == category.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with name '{category.name}' already exists"
        )
    
    # Yeni kategori oluştur
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/", response_model=List[schemas.Category])
async def read_categories(
    skip: int = 0, 
    limit: int = 100, 
    name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Kategorileri listeler. İsme göre filtreleme yapılabilir.
    """
    query = db.query(models.Category)
    
    # İsme göre filtreleme
    if name:
        query = query.filter(models.Category.name.contains(name))
    
    categories = query.offset(skip).limit(limit).all()
    return categories

@router.get("/{category_id}", response_model=schemas.Category)
async def read_category(category_id: int, db: Session = Depends(get_db)):
    """
    ID'ye göre tek bir kategori döndürür.
    """
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    return db_category

@router.put("/{category_id}", response_model=schemas.Category)
async def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """
    Kategoriyi günceller.
    """
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    # Farklı bir kategori aynı isme sahip mi kontrol et
    existing_category = db.query(models.Category).filter(
        models.Category.name == category.name, 
        models.Category.id != category_id
    ).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with name '{category.name}' already exists"
        )
    
    # Kategoriyi güncelle
    for key, value in category.dict().items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    """
    Kategoriyi siler.
    """
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    # Kategoriye bağlı ürünler var mı kontrol et
    products = db.query(models.Product).filter(models.Product.category_id == category_id).count()
    if products > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category that has {products} products. Remove products first."
        )
    
    db.delete(db_category)
    db.commit()
    return None

@router.get("/{category_id}/products", response_model=List[schemas.Product])
async def read_category_products(
    category_id: int, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Belirli bir kategoriye ait ürünleri listeler.
    """
    # Kategorinin var olup olmadığını kontrol et
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    # Kategoriye ait ürünleri getir
    products = db.query(models.Product).filter(
        models.Product.category_id == category_id
    ).offset(skip).limit(limit).all()
    
    return products 