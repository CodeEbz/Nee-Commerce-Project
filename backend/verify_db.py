from database import SessionLocal
import models

def verify():
    db = SessionLocal()
    try:
        businesses = db.query(models.Business).all()
        print(f"Total businesses in DB: {len(businesses)}")
        for biz in businesses:
            print(f"- {biz.name} ({len(biz.products)} products)")
            
        orders = db.query(models.Order).all()
        print(f"\nTotal orders in DB: {len(orders)}")
        
        print("\nDatabase verification successful!")
    except Exception as e:
        print(f"Verification failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify()
