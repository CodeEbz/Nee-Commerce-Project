import requests
import time

BASE_URL = "http://localhost:8000"

def test_signup():
    print("Testing signup...")
    payload = {
        "email": f"test_{int(time.time())}@example.com",
        "nickname": "tester",
        "password": "password123",
        "full_name": "Test User"
    }
    response = requests.post(f"{BASE_URL}/auth/signup", json=payload)
    print(f"Signup response: {response.status_code}, {response.json()}")
    return payload["email"], payload["password"]

def test_login(email, password):
    print(f"Testing login with {email}...")
    payload = {
        "username": email,
        "password": password
    }
    print("Sending POST request to /token...")
    try:
        response = requests.post(f"{BASE_URL}/token", data=payload)
        print(f"Login response status: {response.status_code}")
        if response.status_code == 200:
            token = response.json()["access_token"]
            print("Login successful, token received.")
            return token
        else:
            print(f"Login failed: {response.text}")
    except Exception as e:
        print(f"Login request failed with exception: {e}")
    return None

def test_get_me(token):
    print("Testing /auth/me...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Get Me response: {response.status_code}, {response.json()}")

if __name__ == "__main__":
    try:
        email, password = test_signup()
        token = test_login(email, password)
        if token:
            test_get_me(token)
    except Exception as e:
        print(f"Test failed: {e}. Is the server running?")
