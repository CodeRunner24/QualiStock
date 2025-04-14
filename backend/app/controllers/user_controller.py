from typing import List, Optional, Dict
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Body, Form
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import User, UserCreate, UserUpdate, Token
from ..services.user_service import UserService
from ..auth import create_access_token, get_current_user

# Loglama yapılandırması
logger = logging.getLogger("app.controllers.user_controller")

class UserController:
    def __init__(self):
        self.router = APIRouter(prefix="/users", tags=["users"])
        self.service = UserService()
        self._register_routes()
    
    def _register_routes(self):
        self.router.post("/register", response_model=User)(self.register_user)
        self.router.post("/login", response_model=Token)(self.login_user)
        self.router.get("/", response_model=List[User])(self.get_users)
        self.router.get("/me", response_model=User)(self.get_current_user_info)
        self.router.get("/{user_id}", response_model=User)(self.get_user)
        self.router.put("/{user_id}", response_model=User)(self.update_user)
        self.router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)(self.delete_user)
    
    async def register_user(self, user: UserCreate, db: Session = Depends(get_db)):
        """Kullanıcı kaydı endpointi"""
        logger.info(f"Kullanıcı kayıt isteği alındı: {user.username}, {user.email}")
        try:
            # Kullanıcı verisini detaylı logla
            logger.debug(f"Kullanıcı kayıt detayları: {user.dict(exclude={'password'})}")
            
            # Veritabanı bağlantısı kontrol
            logger.debug(f"DB session aktif: {db is not None}")
            
            db_user = self.service.create_user(db, user)
            logger.info(f"Kullanıcı başarıyla kaydedildi: ID={db_user.id}, username={db_user.username}")
            return db_user
        except HTTPException as ex:
            logger.warning(f"Kullanıcı kaydı başarısız: {ex.detail}")
            raise
        except Exception as e:
            logger.error(f"Kullanıcı kaydı sırasında beklenmeyen hata: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Kullanıcı kaydı sırasında bir hata oluştu: {str(e)}"
            )
    
    async def login_user(self, username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
        """Kullanıcı girişi endpointi"""
        logger.info(f"Kullanıcı giriş isteği: {username}")
        try:
            user = self.service.authenticate_user(db, username, password)
            if not user:
                logger.warning(f"Giriş başarısız: Geçersiz kullanıcı adı veya şifre: {username}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Geçersiz kullanıcı adı veya şifre",
                    headers={"WWW-Authenticate": "Bearer"},
                )
                
            logger.info(f"Kullanıcı girişi başarılı: {username}")
            # Token oluştur
            access_token = create_access_token(data={"sub": user.username})
            return {"access_token": access_token, "token_type": "bearer"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Kullanıcı girişi sırasında beklenmeyen hata: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Giriş işlemi sırasında bir hata oluştu: {str(e)}"
            )
    
    async def get_users(self, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
        """Tüm kullanıcıları listeler (sadece yetkilendirilmiş kullanıcılar için)"""
        logger.info(f"Kullanıcı listesi isteği: skip={skip}, limit={limit}, requester={current_user.username}")
        try:
            return self.service.get_users(db, skip=skip, limit=limit)
        except Exception as e:
            logger.error(f"Kullanıcı listesi alınırken hata: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı listesi alınırken bir hata oluştu"
            )
    
    async def get_user(self, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
        """Belirli bir kullanıcının bilgilerini getirir"""
        logger.info(f"Kullanıcı bilgisi isteği: ID={user_id}, requester={current_user.username}")
        try:
            return self.service.get_user(db, user_id)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Kullanıcı bilgisi alınırken hata: ID={user_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı bilgisi alınırken bir hata oluştu"
            )
    
    async def get_current_user_info(self, current_user: User = Depends(get_current_user)):
        """Mevcut giriş yapmış kullanıcının bilgilerini döndürür"""
        logger.info(f"Mevcut kullanıcı bilgisi isteği: ID={current_user.id}, username={current_user.username}")
        return current_user
    
    async def update_user(self, user_id: int, user: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
        """Kullanıcı bilgilerini günceller"""
        logger.info(f"Kullanıcı güncelleme isteği: ID={user_id}, requester={current_user.username}")
        
        # Sadece kendi hesabını veya admin ise diğer hesapları güncelleyebilir
        if current_user.id != user_id and not current_user.is_admin:
            logger.warning(f"Yetkisiz güncelleme girişimi: Kullanıcı {current_user.username} (ID={current_user.id}) kullanıcı ID={user_id} için güncelleme yapmaya çalıştı")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlem için yetkiniz yok"
            )
        
        try:
            updated_user = self.service.update_user(db, user_id, user)
            logger.info(f"Kullanıcı başarıyla güncellendi: ID={user_id}")
            return updated_user
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Kullanıcı güncellenirken hata: ID={user_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı güncellenirken bir hata oluştu"
            )
    
    async def delete_user(self, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
        """Kullanıcıyı siler"""
        logger.info(f"Kullanıcı silme isteği: ID={user_id}, requester={current_user.username}")
        
        # Sadece kendi hesabını veya admin ise diğer hesapları silebilir
        if current_user.id != user_id and not current_user.is_admin:
            logger.warning(f"Yetkisiz silme girişimi: Kullanıcı {current_user.username} (ID={current_user.id}) kullanıcı ID={user_id} için silme işlemi yapmaya çalıştı")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlem için yetkiniz yok"
            )
        
        try:
            self.service.delete_user(db, user_id)
            logger.info(f"Kullanıcı başarıyla silindi: ID={user_id}")
            return None
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Kullanıcı silinirken hata: ID={user_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı silinirken bir hata oluştu"
            ) 