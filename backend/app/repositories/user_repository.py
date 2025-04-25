from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models import User
from ..schemas import UserCreate, UserUpdate
from .base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)
        
    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        """Kullanıcı adına göre kullanıcı arar"""
        return db.query(User).filter(User.username == username).first()
    
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """E-posta adresine göre kullanıcı arar"""
        return db.query(User).filter(User.email == email).first()
    
    def get_with_username_except_id(self, db: Session, username: str, user_id: int) -> Optional[User]:
        """Belirli bir ID dışında, kullanıcı adı ile eşleşen kullanıcı arar"""
        return db.query(User).filter(
            and_(
                User.username == username,
                User.id != user_id
            )
        ).first()
    
    def get_with_email_except_id(self, db: Session, email: str, user_id: int) -> Optional[User]:
        """Belirli bir ID dışında, e-posta ile eşleşen kullanıcı arar"""
        return db.query(User).filter(
            and_(
                User.email == email,
                User.id != user_id
            )
        ).first() 