from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    print("Testing empty password...")
    pwd_context.hash("")
except Exception as e:
    print(f"Empty password error: {e}")

try:
    print("Testing None password...")
    pwd_context.hash(None)
except Exception as e:
    print(f"None password error: {e}")

try:
    print("Testing long password...")
    pwd_context.hash("a" * 100)
    print("Long password ok (passlib usually handles it)")
except Exception as e:
    print(f"Long password error: {e}")
