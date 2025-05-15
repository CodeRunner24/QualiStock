from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import Base
from .routers import auth, dashboard, quality, expiration, forecasting
from .controllers.category_controller import CategoryController
from .controllers.product_controller import ProductController
from .controllers.user_controller import UserController
from .controllers.stock_item_controller import StockItemController
from .controllers.quality_check_controller import QualityCheckController
from .controllers.forecast_controller import ForecastController
import sys
import os
from .initialize_missing_stock import initialize_missing_stock_items

# Middleware dizinini Python yoluna ekle
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), "middleware"))
from cors import setup_cors

# Veritabanı tabloları oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QualiStock API",
    description="QualiStock envanter yönetim sistemi için API",
    version="1.0.0"
)

# CORS ayarlarını yeni middleware ile yap
app = setup_cors(app)

# Initialize zero-quantity stock items for products missing from stock_items
initialize_missing_stock_items()

# Eski router'ları dahil et (zamanla tamamen kaldırılabilir)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(quality.router)
app.include_router(expiration.router)
app.include_router(forecasting.router)

# Katmanlı mimariye uygun controller'ları dahil et
category_controller = CategoryController()
app.include_router(category_controller.router)

product_controller = ProductController()
app.include_router(product_controller.router)

user_controller = UserController()
app.include_router(user_controller.router)

stock_item_controller = StockItemController()
app.include_router(stock_item_controller.router)

quality_check_controller = QualityCheckController()
app.include_router(quality_check_controller.router)

forecast_controller = ForecastController()
app.include_router(forecast_controller.router)

@app.get("/")
async def root():
    return {"message": "QualiStock API'ye Hoş Geldiniz! /docs URL'sine giderek API dokümanını görüntüleyebilirsiniz."}

# Test verileri oluşturmak için yardımcı fonksiyon
@app.post("/init-test-data", tags=["admin"])
async def init_test_data():
    from sqlalchemy.orm import Session
    from .models import User, Category, Product, StockItem, QualityCheck, QualityStatus, Forecast
    from .database import SessionLocal
    from .auth import get_password_hash
    from datetime import datetime, timedelta
    import random

    db = SessionLocal()
    try:
        # Test verileri oluşturuldu mu kontrol et
        if db.query(User).count() > 0:
            return {"message": "Test verileri zaten oluşturulmuş"}
        
        # Test kullanıcısı oluştur
        hashed_password = get_password_hash("password")
        admin_user = User(
            username="admin",
            email="admin@example.com",
            hashed_password=hashed_password,
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        # Kategori oluştur
        categories = [
            Category(name="Gıda", description="Yiyecek ve içecek ürünleri"),
            Category(name="Elektronik", description="Elektronik cihazlar ve aksesuarlar"),
            Category(name="Giyim", description="Kıyafet ve ayakkabılar"),
        ]
        db.add_all(categories)
        db.commit()
        
        # Ürünler oluştur
        products = [
            Product(name="Elma", sku="FOOD001", category_id=1, unit_price=5.99),
            Product(name="Portakal", sku="FOOD002", category_id=1, unit_price=6.99),
            Product(name="Laptop", sku="ELEC001", category_id=2, unit_price=1299.99),
            Product(name="Akıllı Telefon", sku="ELEC002", category_id=2, unit_price=999.99),
            Product(name="T-Shirt", sku="CLOTH001", category_id=3, unit_price=19.99),
            Product(name="Kot Pantolon", sku="CLOTH002", category_id=3, unit_price=49.99),
        ]
        db.add_all(products)
        db.commit()
        
        # Stok öğeleri oluştur
        now = datetime.utcnow()
        stock_items = []
        
        locations = ["Depo A", "Depo B", "Depo C"]
        
        for i, product in enumerate(products):
            for j in range(1, 4):  # Her ürün için 3 farklı stok öğesi
                expiration_days = None
                if product.category_id == 1:  # Gıda ürünleri için son kullanma tarihi
                    expiration_days = random.randint(10, 90)
                
                stock_items.append(StockItem(
                    product_id=product.id,
                    quantity=random.randint(5, 100),
                    location=random.choice(locations),
                    batch_number=f"BATCH{i+1}{j}",
                    manufacturing_date=now - timedelta(days=random.randint(10, 30)),
                    expiration_date=now + timedelta(days=expiration_days) if expiration_days else None
                ))
        
        db.add_all(stock_items)
        db.commit()
        
        # Kalite kontrolleri oluştur
        quality_checks = []
        statuses = list(QualityStatus)
        
        for i, product in enumerate(products):
            status = random.choice(statuses)
            quality_checks.append(QualityCheck(
                product_id=product.id,
                batch_number=f"BATCH{i+1}1",  # İlk parti
                status=status,
                notes=f"Kontrol notu: {status.value}",
                checked_by=admin_user.id
            ))
        
        db.add_all(quality_checks)
        db.commit()
        
        # Talep tahminleri oluştur
        forecasts = []
        for product in products:
            for i in range(1, 4):  # Her ürün için 3 farklı tahmin
                forecasts.append(Forecast(
                    product_id=product.id,
                    forecast_date=now + timedelta(days=30*i),
                    predicted_demand=random.randint(20, 50),
                    confidence_level=round(random.uniform(0.6, 0.95), 2),
                    notes=f"{30*i} gün sonrası için tahmin"
                ))
        
        db.add_all(forecasts)
        db.commit()
        
        return {"message": "Test verileri başarıyla oluşturuldu"}
    
    finally:
        db.close() 