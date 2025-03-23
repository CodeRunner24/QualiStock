import os
import uvicorn
from dotenv import load_dotenv
from app.main import app

# .env dosyasından çevre değişkenlerini yükle
load_dotenv()

# Sunucu portu ve host'unu belirle
PORT = int(os.getenv("PORT", 8001))  # 8000 yerine 8001 kullanılıyor
HOST = os.getenv("HOST", "127.0.0.1")

if __name__ == "__main__":
    # Sunucuyu başlat
    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        reload=True
    ) 