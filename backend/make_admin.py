import sys
from database import SessionLocal
import models
import argparse

def make_admin(email):
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            print(f"Error: User with email '{email}' not found.")
            return
        
        user.is_admin = True
        db.commit()
        print(f"Success: User '{email}' has been promoted to Admin.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Promote a user to Admin status.")
    parser.add_argument("email", help="The email of the user to promote")
    args = parser.parse_args()
    
    make_admin(args.email)
