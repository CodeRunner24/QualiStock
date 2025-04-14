from typing import List, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Form, Body
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import Product, ProductCreate, ProductUpdate, User
from ..services.product_service import ProductService
from ..auth import get_current_user

# Loglama yapılandırması
logger = logging.getLogger("app.controllers.product_controller")

class ProductController:
    def __init__(self):
        self.router = APIRouter(prefix="/products", tags=["products"])
        self.service = ProductService()
        self._register_routes()
    
    def _register_routes(self):
        self.router.post("/", response_model=Product)(self.create_product)
        self.router.get("/", response_model=List[Product])(self.get_products)
        self.router.get("/{product_id}", response_model=Product)(self.get_product)
        self.router.put("/{product_id}", response_model=Product)(self.update_product)
        self.router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)(self.delete_product)
        self.router.get("/{product_id}/stock")(self.get_product_stock)
    
    async def create_product(self, 
                            product: ProductCreate = Body(...), 
                            db: Session = Depends(get_db), 
                            current_user: User = Depends(get_current_user)):
        """Yeni bir ürün oluşturur"""
        logger.info(f"Ürün oluşturma isteği: {product.name}, kullanıcı: {current_user.username}")
        logger.debug(f"Ürün verileri: {product.dict()}")
        
        try:
            # Veritabanı oturumunu kontrol et
            logger.debug(f"DB bağlantısı aktif: {db is not None}")
            
            # Ürün oluşturucuyu (owner) mevcut kullanıcı olarak ayarla
            # product_dict = product.dict()
            # product_dict["owner_id"] = current_user.id
            # Şema güncellendiyse yukarıdaki owner_id ayarlaması kullanılabilir
            
            db_product = self.service.create_product(db, product)
            logger.info(f"Ürün başarıyla oluşturuldu: ID={db_product.id}, name={db_product.name}")
            return db_product
        except HTTPException as ex:
            logger.warning(f"Ürün oluşturma başarısız: {ex.detail}")
            raise
        except Exception as e:
            logger.error(f"Ürün oluşturulurken beklenmeyen hata: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ürün oluşturulurken bir hata oluştu: {str(e)}"
            )
    
    async def get_products(self, 
                          skip: int = 0, 
                          limit: int = 100, 
                          name: Optional[str] = None,
                          category_id: Optional[int] = None,
                          db: Session = Depends(get_db)):
        """Ürünleri listeler ve filtreleme seçenekleri sunar"""
        logger.info(f"Ürün listesi isteği: skip={skip}, limit={limit}, name={name}, category_id={category_id}")
        try:
            products = self.service.get_products(
                db, 
                skip=skip, 
                limit=limit, 
                category_id=category_id,
                name=name
            )
            logger.info(f"Ürün listesi başarıyla alındı, {len(products)} ürün bulundu")
            return products
        except Exception as e:
            logger.error(f"Ürün listesi alınırken hata: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ürün listesi alınırken bir hata oluştu: {str(e)}"
            )
    
    async def get_product(self, product_id: int, db: Session = Depends(get_db)):
        """Belirli bir ürünün bilgilerini getirir"""
        logger.info(f"Ürün bilgisi isteği: ID={product_id}")
        try:
            product = self.service.get_product(db, product_id)
            logger.info(f"Ürün bilgisi başarıyla alındı: ID={product_id}")
            return product
        except HTTPException as ex:
            logger.warning(f"Ürün bilgisi alınamadı: {ex.detail}")
            raise
        except Exception as e:
            logger.error(f"Ürün bilgisi alınırken hata: ID={product_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ürün bilgisi alınırken bir hata oluştu: {str(e)}"
            )
    
    async def update_product(self, 
                             product_id: int, 
                             product: ProductUpdate = Body(...), 
                             db: Session = Depends(get_db), 
                             current_user: User = Depends(get_current_user)):
        """Ürün bilgilerini günceller"""
        logger.info(f"Ürün güncelleme isteği: ID={product_id}, kullanıcı: {current_user.username}")
        logger.debug(f"Ürün güncelleme verileri: {product.dict()}")
        
        try:
            # Önce ürünü kontrol et 
            existing_product = self.service.get_product(db, product_id)
            
            # Eğer ürün modelinde owner_id yoksa, burada yetki kontrolü gerekebilir
            # if hasattr(existing_product, 'owner_id') and existing_product.owner_id != current_user.id and not current_user.is_admin:
            #     logger.warning(f"Yetkisiz güncelleme girişimi: Kullanıcı {current_user.username} (ID={current_user.id}) ürün ID={product_id} için güncelleme yapmaya çalıştı")
            #     raise HTTPException(
            #         status_code=status.HTTP_403_FORBIDDEN,
            #         detail="Bu ürünü güncelleme yetkiniz yok"
            #     )
            
            updated_product = self.service.update_product(db, product_id, product)
            logger.info(f"Ürün başarıyla güncellendi: ID={product_id}")
            return updated_product
            
        except HTTPException as ex:
            logger.warning(f"Ürün güncelleme başarısız: {ex.detail}")
            raise
        except Exception as e:
            logger.error(f"Ürün güncellenirken hata: ID={product_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ürün güncellenirken bir hata oluştu: {str(e)}"
            )
    
    async def delete_product(self, 
                            product_id: int, 
                            db: Session = Depends(get_db), 
                            current_user: User = Depends(get_current_user)):
        """Ürünü siler"""
        logger.info(f"Ürün silme isteği: ID={product_id}, kullanıcı: {current_user.username}")
        try:
            # Önce ürünü kontrol et
            existing_product = self.service.get_product(db, product_id)
            
            # Eğer ürün modelinde owner_id yoksa, burada yetki kontrolü gerekebilir
            # if hasattr(existing_product, 'owner_id') and existing_product.owner_id != current_user.id and not current_user.is_admin:
            #     logger.warning(f"Yetkisiz silme girişimi: Kullanıcı {current_user.username} (ID={current_user.id}) ürün ID={product_id} için silme yapmaya çalıştı")
            #     raise HTTPException(
            #         status_code=status.HTTP_403_FORBIDDEN,
            #         detail="Bu ürünü silme yetkiniz yok"
            #     )
            
            self.service.delete_product(db, product_id)
            logger.info(f"Ürün başarıyla silindi: ID={product_id}")
            return None
            
        except HTTPException as ex:
            logger.warning(f"Ürün silme başarısız: {ex.detail}")
            raise
        except Exception as e:
            logger.error(f"Ürün silinirken hata: ID={product_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ürün silinirken bir hata oluştu: {str(e)}"
            )
            
    async def get_product_stock(self, product_id: int, db: Session = Depends(get_db)):
        """Ürüne ait stok bilgilerini getirir"""
        logger.info(f"Ürün stok bilgisi isteği: ID={product_id}")
        try:
            stock_items = self.service.get_product_stock_items(db, product_id, 0, 100)
            logger.info(f"Ürün stok bilgisi başarıyla alındı: ID={product_id}, {len(stock_items)} stok öğesi")
            return stock_items
        except HTTPException as ex:
            logger.warning(f"Ürün stok bilgisi alınamadı: {ex.detail}")
            raise
        except Exception as e:
            logger.error(f"Ürün stok bilgisi alınırken hata: ID={product_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ürün stok bilgisi alınırken bir hata oluştu: {str(e)}"
            ) 