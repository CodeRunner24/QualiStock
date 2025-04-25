from typing import Generic, TypeVar, Type, List, Optional, Any, Dict, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        """
        Repository için CRUD işlemlerini sağlayan temel sınıf
        :param model: SQLAlchemy modeli
        """
        self.model = model

    def get_by_id(self, db: Session, id: Any) -> Optional[ModelType]:
        """ID'ye göre tek kayıt döndürür"""
        return db.query(self.model).filter(self.model.id == id).first()

    def get_by_condition(self, db: Session, **kwargs) -> Optional[ModelType]:
        """Belirtilen koşullara göre tek kayıt döndürür"""
        return db.query(self.model).filter_by(**kwargs).first()
    
    def get_all(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100, 
        filter_condition=None
    ) -> List[ModelType]:
        """Kayıtları listeler, isteğe bağlı filtreleme yapar"""
        query = db.query(self.model)
        if filter_condition:
            query = query.filter(filter_condition)
        return query.offset(skip).limit(limit).all()
    
    def count(self, db: Session, filter_condition=None) -> int:
        """Belirtilen koşula göre kayıt sayısını döndürür"""
        query = db.query(func.count(self.model.id))
        if filter_condition:
            query = query.filter(filter_condition)
        return query.scalar()

    def create(self, db: Session, obj_in: Dict[str, Any]) -> ModelType:
        """Yeni kayıt oluşturur"""
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, id: int, obj_in: Dict[str, Any]) -> Optional[ModelType]:
        """Mevcut bir kaydı günceller"""
        db_obj = self.get_by_id(db, id)
        if db_obj is None:
            return None
            
        for key, value in obj_in.items():
            if hasattr(db_obj, key):
                setattr(db_obj, key, value)
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> bool:
        """ID'ye göre kayıt siler"""
        db_obj = self.get_by_id(db, id)
        if db_obj is None:
            return False
        
        db.delete(db_obj)
        db.commit()
        return True 