
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from main import app
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    print("Hitting /orders...")
    response = client.get("/orders")
    print(f"Status: {response.status_code}")
    print(f"Body: {response.json()}")
    
    print("\nHitting /businesses...")
    response = client.get("/businesses")
    print(f"Status: {response.status_code}")
    
    print("\nSUCCESS: API is functional")
except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
