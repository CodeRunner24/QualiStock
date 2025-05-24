"""
This script initializes zero-quantity stock items for all products that are missing entries
in the stock_items table. It ensures that every product has a corresponding stock entry.
"""

import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Add parent directory to path to allow importing from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import Product, StockItem, Base
from app.database import SessionLocal
from app.repositories.product_repository import ProductRepository
from app.repositories.stock_item_repository import StockItemRepository

def initialize_missing_stock_items():
    """Find all products without stock items and create zero-quantity entries for them"""
    db = SessionLocal()
    
    try:
        # Get all products
        products = db.query(Product).all()
        print(f"Found {len(products)} products")
        
        # Count of added items
        added_count = 0
        
        for product in products:
            # Check if this product has any stock items
            stock_item = db.query(StockItem).filter(StockItem.product_id == product.id).first()
            
            if not stock_item:
                print(f"Adding zero-quantity stock for product: {product.name} (ID: {product.id})")
                
                # Create a new stock item with zero quantity
                new_stock = StockItem(
                    product_id=product.id,
                    quantity=0,
                    location="Not in stock",
                    batch_number="EMPTY"
                )
                db.add(new_stock)
                added_count += 1
        
        # Commit all changes
        db.commit()
        print(f"Added {added_count} zero-quantity stock items for previously missing products")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing missing stock items...")
    initialize_missing_stock_items()
    print("Process completed.") 