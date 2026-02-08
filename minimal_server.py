
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def home():
    return {"status": "ok"}

if __name__ == "__main__":
    print("Starting minimal server on 127.0.0.1:8080...")
    uvicorn.run(app, host="127.0.0.1", port=8080)
