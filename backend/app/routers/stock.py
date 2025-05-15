from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/stock",
    tags=["stock"],
    dependencies=[Depends(auth.get_current_active_user)],
    responses={404: {"description": "Not found"}},
)

@router.post("/items/", response_model=schemas.StockItem)
async def create_stock_item(item: schemas.StockItemCreate, db: Session = Depends(get_db)):
    """
    Yeni bir stok öğesi oluşturur.
    """
    # Ürünün var olup olmadığını kontrol et
    product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {item.product_id} not found"
        )
    
    # Check if stock item already exists for this product
    existing_stock_item = db.query(models.StockItem).filter(models.StockItem.product_id == item.product_id).first()
    if existing_stock_item:
        # Update the existing stock item instead of creating a new one
        for key, value in item.dict().items():
            setattr(existing_stock_item, key, value)
        db.commit()
        db.refresh(existing_stock_item)
        return existing_stock_item
    
    # Create a new stock item if one doesn't exist
    db_item = models.StockItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/items/", response_model=List[schemas.StockItem])
async def read_stock_items(
    skip: int = 0, 
    limit: int = 100, 
    location: Optional[str] = None,
    product_id: Optional[int] = None,
    min_quantity: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Stok öğelerini listeler. Filtreleme parametreleri kullanılabilir.
    """
    query = db.query(models.StockItem)
    
    # Filtreleme
    if location:
        query = query.filter(models.StockItem.location.contains(location))
    if product_id:
        query = query.filter(models.StockItem.product_id == product_id)
    if min_quantity is not None:
        query = query.filter(models.StockItem.quantity >= min_quantity)
    
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/items/{item_id}", response_model=schemas.StockItem)
async def read_stock_item(item_id: int, db: Session = Depends(get_db)):
    """
    ID'ye göre tek bir stok öğesi döndürür.
    """
    db_item = db.query(models.StockItem).filter(models.StockItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock item with id {item_id} not found"
        )
    return db_item

@router.put("/items/{item_id}", response_model=schemas.StockItem)
async def update_stock_item(item_id: int, item: schemas.StockItemUpdate, db: Session = Depends(get_db)):
    """
    Stok öğesini günceller.
    """
    db_item = db.query(models.StockItem).filter(models.StockItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock item with id {item_id} not found"
        )
    
    # Ürünün var olup olmadığını kontrol et (if product_id is provided)
    if item.product_id is not None:
        if not db.query(models.Product).filter(models.Product.id == item.product_id).first():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found"
            )
    
    # Stok öğesini güncelle - only update provided fields
    update_data = item.dict(exclude_unset=True)
    for key, value in update_data.items():
        # Only update fields that are not None (to preserve existing values)
        if value is not None:
            setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stock_item(item_id: int, db: Session = Depends(get_db)):
    """
    Stok öğesini siler.
    """
    db_item = db.query(models.StockItem).filter(models.StockItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock item with id {item_id} not found"
        )
    
    # If quantity is already 0, don't delete the item
    if db_item.quantity == 0:
        return None
    
    # Set quantity to 0 instead of deleting
    db_item.quantity = 0
    # Clear all additional information
    db_item.batch_number = ""
    db_item.manufacturing_date = None
    db_item.expiration_date = None
    db_item.location = ""
    db.commit()
    return None

@router.post("/products/{product_id}/set-zero-stock", response_model=schemas.StockItem)
async def set_product_stock_to_zero(
    product_id: int, 
    location: str = "Not in stock",
    batch_number: str = "EMPTY",
    db: Session = Depends(get_db)
):
    """
    Ürün stokunu sıfıra ayarlar. Eğer stok öğesi yoksa, sıfır stoklu bir öğe oluşturur.
    """
    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    
    # Check if stock item exists
    stock_item = db.query(models.StockItem).filter(models.StockItem.product_id == product_id).first()
    
    if stock_item:
        # Update existing stock item to zero
        stock_item.quantity = 0
        db.commit()
        db.refresh(stock_item)
        return stock_item
    else:
        # Create new stock item with zero quantity
        new_stock = models.StockItem(
            product_id=product_id,
            quantity=0,
            location=location,
            batch_number=batch_number
        )
        db.add(new_stock)
        db.commit()
        db.refresh(new_stock)
        return new_stock

@router.post("/products/", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """
    Yeni bir ürün oluşturur.
    """
    # SKU'nun benzersiz olup olmadığını kontrol et
    if db.query(models.Product).filter(models.Product.sku == product.sku).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU {product.sku} already exists"
        )
    
    # Kategorinin var olup olmadığını kontrol et
    if not db.query(models.Category).filter(models.Category.id == product.category_id).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {product.category_id} not found"
        )
    
    # Yeni ürünü oluştur
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Create a stock item with zero quantity for the new product
    stock_item = models.StockItem(
        product_id=db_product.id,
        quantity=0,
        location="Not in stock",
        batch_number="EMPTY"
    )
    db.add(stock_item)
    db.commit()
    
    return db_product

@router.get("/products/", response_model=List[schemas.Product])
async def read_products(
    skip: int = 0, 
    limit: int = 100, 
    name: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Ürünleri listeler. Filtreleme parametreleri kullanılabilir.
    """
    query = db.query(models.Product)
    
    # Filtreleme
    if name:
        query = query.filter(models.Product.name.contains(name))
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/products/{product_id}", response_model=schemas.Product)
async def read_product(product_id: int, db: Session = Depends(get_db)):
    """
    ID'ye göre tek bir ürün döndürür.
    """
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    return db_product

@router.put("/products/{product_id}", response_model=schemas.Product)
async def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """
    Ürünü günceller.
    """
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    
    # SKU'nun benzersiz olup olmadığını kontrol et (aynı ürün değilse)
    sku_check = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if sku_check and sku_check.id != product_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU {product.sku} already exists"
        )
    
    # Kategorinin var olup olmadığını kontrol et
    if not db.query(models.Category).filter(models.Category.id == product.category_id).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {product.category_id} not found"
        )
    
    # Ürünü güncelle
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Ürünü siler. İlişkili stok öğeleri ve kalite kontrolleri varsa silme işlemi engellenir.
    """
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    
    # İlişkili stok öğeleri varsa engelle
    if db.query(models.StockItem).filter(models.StockItem.product_id == product_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete product with id {product_id}, it has associated stock items"
        )
    
    # İlişkili kalite kontrolleri varsa engelle
    if db.query(models.QualityCheck).filter(models.QualityCheck.product_id == product_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete product with id {product_id}, it has associated quality checks"
        )
    
    db.delete(db_product)
    db.commit()
    return None 