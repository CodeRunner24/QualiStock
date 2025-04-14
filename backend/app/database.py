from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging

# Loglama ayarları
logger = logging.getLogger("app.database")

# .env dosyasını yükle
load_dotenv()

# Veritabanı URL'si
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///../qualistock.db")

logger.info(f"Veritabanı URL: {DATABASE_URL}")
logger.info(f"Çalışma dizini: {os.getcwd()}")

# SQLite için bağlantı ayarlarını yapılandır
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=True  # SQL sorgularını loglamak için
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Veritabanı bağlantısı için yardımcı fonksiyon
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 