from typing import List, Optional
import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.user_repository import UserRepository
from ..models import User
from ..schemas import UserCreate, UserUpdate
from ..auth import get_password_hash, verify_password

# Loglama yapılandırması
logger = logging.getLogger("app.services.user_service")

class UserService:
    def __init__(self):
        self.repository = UserRepository()
    
    def create_user(self, db: Session, user: UserCreate) -> User:
        """Yeni kullanıcı oluşturur"""
        logger.info(f"Yeni kullanıcı oluşturma isteği: {user.username}, {user.email}")
        
        try:
            # Aynı kullanıcı adıyla kullanıcı var mı kontrol et
            existing_username = self.repository.get_by_username(db, user.username)
            if existing_username:
                logger.warning(f"Kullanıcı adı zaten mevcut: {user.username}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Username '{user.username}' already exists"
                )
            
            # Aynı e-postayla kullanıcı var mı kontrol et
            existing_email = self.repository.get_by_email(db, user.email)
            if existing_email:
                logger.warning(f"E-posta adresi zaten kayıtlı: {user.email}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email '{user.email}' already registered"
                )
            
            # Şifreyi hashle
            hashed_password = get_password_hash(user.password)
            
            # UserCreate verisini bir dict'e dönüştür ve şifreyi hashlenmiş şifreyle değiştir
            user_data = user.dict()
            user_data.pop("password")
            user_data["hashed_password"] = hashed_password
            
            # Kullanıcıyı oluştur
            db_user = User(**user_data)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            logger.info(f"Kullanıcı başarıyla oluşturuldu: ID={db_user.id}, username={db_user.username}")
            return db_user
            
        except HTTPException:
            # Zaten yakalanmış HTTP hataları tekrar fırlat
            raise
        except Exception as e:
            # Beklenmeyen hatalar için
            logger.error(f"Kullanıcı oluştururken hata: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı oluşturulurken bir hata oluştu"
            )
    
    def get_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Kullanıcıları listeler"""
        logger.info(f"Tüm kullanıcılar listeleniyor: skip={skip}, limit={limit}")
        try:
            users = self.repository.get_all(db, skip=skip, limit=limit)
            logger.info(f"Toplam {len(users)} kullanıcı listelendi")
            return users
        except Exception as e:
            logger.error(f"Kullanıcıları listelerken hata: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcılar listelenirken bir hata oluştu"
            )
    
    def get_user(self, db: Session, user_id: int) -> User:
        """ID'ye göre kullanıcı döndürür"""
        logger.info(f"Kullanıcı bilgileri istendi: ID={user_id}")
        try:
            user = self.repository.get(db, user_id)
            if not user:
                logger.warning(f"Kullanıcı bulunamadı: ID={user_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User with id {user_id} not found"
                )
            logger.info(f"Kullanıcı bulundu: ID={user_id}, username={user.username}")
            return user
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Kullanıcı bilgilerini getirirken hata: ID={user_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı bilgileri alınırken bir hata oluştu"
            )
    
    def get_user_by_username(self, db: Session, username: str) -> Optional[User]:
        """Kullanıcı adına göre kullanıcı döndürür"""
        logger.debug(f"Kullanıcı adına göre arama: {username}")
        try:
            return self.repository.get_by_username(db, username)
        except Exception as e:
            logger.error(f"Kullanıcı adına göre arama sırasında hata: {username}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı aranırken bir hata oluştu"
            )
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """E-posta adresine göre kullanıcı döndürür"""
        logger.debug(f"E-posta adresine göre arama: {email}")
        try:
            return self.repository.get_by_email(db, email)
        except Exception as e:
            logger.error(f"E-posta adresine göre arama sırasında hata: {email}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı aranırken bir hata oluştu"
            )
    
    def update_user(self, db: Session, user_id: int, user: UserUpdate) -> User:
        """Kullanıcıyı günceller"""
        logger.info(f"Kullanıcı güncelleme isteği: ID={user_id}, username={user.username}, email={user.email}")
        try:
            db_user = self.get_user(db, user_id)
            
            # Farklı bir kullanıcı aynı kullanıcı adına sahip mi kontrol et
            if user.username != db_user.username:
                logger.debug(f"Kullanıcı adı değişikliği kontrol ediliyor: {db_user.username} -> {user.username}")
                existing = self.repository.get_with_username_except_id(db, user.username, user_id)
                if existing:
                    logger.warning(f"Kullanıcı adı başka bir kullanıcı tarafından kullanılıyor: {user.username}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Username '{user.username}' already exists"
                    )
            
            # Farklı bir kullanıcı aynı e-postaya sahip mi kontrol et
            if user.email != db_user.email:
                logger.debug(f"E-posta değişikliği kontrol ediliyor: {db_user.email} -> {user.email}")
                existing = self.repository.get_with_email_except_id(db, user.email, user_id)
                if existing:
                    logger.warning(f"E-posta başka bir kullanıcı tarafından kullanılıyor: {user.email}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Email '{user.email}' already registered"
                    )
            
            # UserUpdate verilerini bir dict'e dönüştür
            update_data = user.dict(exclude_unset=True)
            
            # Şifre değiştirilecekse hashle
            if "password" in update_data and update_data["password"]:
                logger.debug(f"Kullanıcı şifresi güncelleniyor: ID={user_id}")
                hashed_password = get_password_hash(update_data.pop("password"))
                update_data["hashed_password"] = hashed_password
            
            # Güncelleme işlemi
            for key, value in update_data.items():
                if key != "password":  # Şifre alanını atla
                    setattr(db_user, key, value)
            
            db.commit()
            db.refresh(db_user)
            logger.info(f"Kullanıcı başarıyla güncellendi: ID={user_id}")
            return db_user
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Kullanıcı güncellenirken hata: ID={user_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı güncellenirken bir hata oluştu"
            )
    
    def delete_user(self, db: Session, user_id: int) -> None:
        """Kullanıcıyı siler"""
        logger.info(f"Kullanıcı silme isteği: ID={user_id}")
        try:
            db_user = self.get_user(db, user_id)
            db.delete(db_user)
            db.commit()
            logger.info(f"Kullanıcı başarıyla silindi: ID={user_id}, username={db_user.username}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Kullanıcı silinirken hata: ID={user_id}, error={str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Kullanıcı silinirken bir hata oluştu"
            )
    
    def authenticate_user(self, db: Session, username: str, password: str) -> Optional[User]:
        """Kullanıcı doğrulama"""
        logger.info(f"Kullanıcı doğrulama girişimi: {username}")
        try:
            user = self.get_user_by_username(db, username)
            if not user:
                logger.warning(f"Kullanıcı adı bulunamadı: {username}")
                return None
                
            if not verify_password(password, user.hashed_password):
                logger.warning(f"Şifre doğrulama başarısız: {username}")
                return None
                
            logger.info(f"Kullanıcı başarıyla doğrulandı: {username}")
            return user
        except Exception as e:
            logger.error(f"Kullanıcı doğrulama sırasında hata: {username}, error={str(e)}", exc_info=True)
            return None 