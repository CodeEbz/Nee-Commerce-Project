import requests
import bcrypt

print("Testing requests...")
try:
    r = requests.get("http://localhost:8000/ping")
    print(f"Ping: {r.status_code}")
except Exception as e:
    print(f"Requests error: {e}")

print("Testing bcrypt...")
try:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(b"password", salt)
    print(f"Bcrypt hash: {hashed.decode('utf-8')}")
except Exception as e:
    print(f"Bcrypt error: {e}")
