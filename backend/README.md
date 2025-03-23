# QualiStock Backend API

Bu proje, QualiStock envanter yönetim sistemi için FastAPI ile geliştirilmiş REST API'dir.

## Özellikler

- Kullanıcı kimlik doğrulama ve yetkilendirme (JWT tabanlı)
- Stok yönetimi ve takibi
- Kalite kontrol sistemi
- Son kullanma tarihi takibi
- Talep tahminleri ve piyasa trendleri
- RESTful API tasarımı

## Teknolojiler

- Python 3.9+
- FastAPI
- SQLAlchemy (ORM)
- Pydantic
- JWT Kimlik Doğrulama
- SQLite (Geliştirme ortamı için)

## Kurulum

1. Gereksinimleri yükleyin:

```bash
pip install -r requirements.txt
```

2. Uygulamayı çalıştırın:

```bash
cd backend
uvicorn app.main:app --reload
```

3. API dokümantasyonuna erişin:

```
http://localhost:8000/docs
```

## Veritabanı Şeması

Uygulama aşağıdaki veritabanı tablolarını kullanmaktadır:

- users: Kullanıcı bilgileri ve kimlik doğrulama
- categories: Ürün kategorileri
- products: Ürün bilgileri
- stock_items: Stok bilgileri
- quality_checks: Kalite kontrol kayıtları
- forecasts: Talep tahminleri
- market_trends: Piyasa trendleri

## API Endpoint'leri

### Kimlik Doğrulama

- `POST /auth/token`: JWT token almak için giriş yapın
- `POST /auth/register`: Yeni kullanıcı oluşturun

### Dashboard

- `GET /dashboard/stats`: Dashboard istatistiklerini alın
- `GET /dashboard/quality-issues`: Kalite sorunlarını listeleyin
- `GET /dashboard/expiring-soon`: Yakında sona erecek öğeleri listeleyin
- `GET /dashboard/low-stock`: Düşük stok öğelerini listeleyin

### Stok Yönetimi

- `GET /stock/products/`: Ürünleri listeleyin
- `POST /stock/products/`: Yeni ürün oluşturun
- `GET /stock/items/`: Stok öğelerini listeleyin
- `POST /stock/items/`: Yeni stok öğesi oluşturun

### Kalite Kontrolü

- `GET /quality/checks/`: Kalite kontrollerini listeleyin
- `POST /quality/checks/`: Yeni kalite kontrolü oluşturun
- `GET /quality/stats/by-status`: Durum bazında kalite istatistiklerini alın

### Son Kullanma Tarihi Takibi

- `GET /expiration/items/`: Sona eren öğeleri listeleyin
- `GET /expiration/stats`: Son kullanma tarihi istatistiklerini alın
- `GET /expiration/critical`: Kritik sona erme öğelerini alın

### Tahmin ve Trendler

- `GET /forecasting/predictions/`: Talep tahminlerini listeleyin
- `POST /forecasting/predictions/`: Yeni talep tahmini oluşturun
- `GET /forecasting/trends/`: Piyasa trendlerini listeleyin
- `GET /forecasting/stats/top-products`: En çok talep edilen ürünleri alın
