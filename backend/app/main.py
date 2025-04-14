from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import auth, dashboard, quality, expiration, forecasting
from .controllers.category_controller import CategoryController
from .controllers.product_controller import ProductController
from .controllers.user_controller import UserController
from .controllers.stock_item_controller import StockItemController

# Veritabanı tabloları oluştur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QualiStock API",
    description="QualiStock envanter yönetim sistemi için API",
    version="1.0.0"
)

# CORS ayarları
origins = [
    "http://localhost",
    "http://localhost:3000",  # React uygulaması için
    "http://localhost:5173",  # Vite geliştirme sunucusu için
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları dahil et
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(quality.router)
app.include_router(expiration.router)
app.include_router(forecasting.router)

# Yeni mimari için controller'ları dahil et
category_controller = CategoryController()
app.include_router(category_controller.router)

product_controller = ProductController()
app.include_router(product_controller.router)

user_controller = UserController()
app.include_router(user_controller.router)

stock_item_controller = StockItemController()
app.include_router(stock_item_controller.router)

@app.get("/")
async def root():
    return {"message": "QualiStock API'ye Hoş Geldiniz! /docs URL'sine giderek API dokümanını görüntüleyebilirsiniz."}

# Test verileri oluşturmak için yardımcı fonksiyon
@app.post("/init-test-data", tags=["admin"])
async def init_test_data():
    from sqlalchemy.orm import Session
    from . import models, auth
    from .database import SessionLocal
    from datetime import datetime, timedelta
    import random

    db = SessionLocal()
    try:
        # Test verileri oluşturuldu mu kontrol et
        if db.query(models.User).count() > 0:
            return {"message": "Test verileri zaten oluşturulmuş"}
        
        # Test kullanıcısı oluştur
        hashed_password = auth.get_password_hash("password")
        admin_user = models.User(
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
            models.Category(name="Gıda", description="Yiyecek ve içecek ürünleri"),
            models.Category(name="Elektronik", description="Elektronik cihazlar ve aksesuarlar"),
            models.Category(name="Giyim", description="Kıyafet ve ayakkabılar"),
        ]
        db.add_all(categories)
        db.commit()
        
        # Ürünler oluştur
        products = [
            models.Product(name="Elma", sku="FOOD001", category_id=1, unit_price=5.99),
            models.Product(name="Portakal", sku="FOOD002", category_id=1, unit_price=6.99),
            models.Product(name="Laptop", sku="ELEC001", category_id=2, unit_price=1299.99),
            models.Product(name="Akıllı Telefon", sku="ELEC002", category_id=2, unit_price=999.99),
            models.Product(name="T-Shirt", sku="CLOTH001", category_id=3, unit_price=19.99),
            models.Product(name="Kot Pantolon", sku="CLOTH002", category_id=3, unit_price=49.99),
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
                
                stock_items.append(models.StockItem(
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
        statuses = list(models.QualityStatus)
        
        for i, product in enumerate(products):
            status = random.choice(statuses)
            quality_checks.append(models.QualityCheck(
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
                forecasts.append(models.Forecast(
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