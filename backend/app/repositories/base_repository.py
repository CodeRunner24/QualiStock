from typing import Generic, TypeVar, Type, List, Optional, Any, Dict, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        Repository için CRUD işlemlerini sağlayan temel sınıf
        :param model: SQLAlchemy modeli
        """
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
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

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """Yeni kayıt oluşturur"""
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, 
        db: Session, 
        *, 
        db_obj: ModelType, 
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """Mevcut bir kaydı günceller"""
        obj_data = jsonable_encoder(db_obj)
        
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: int) -> ModelType:
        """ID'ye göre kayıt siler"""
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj 