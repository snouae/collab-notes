import uvicorn
from app.main import app
from app.db.init_db import init_db
from app.db.init_data import init_test_data
from app.db.database import SessionLocal

def init_application():
    init_db()
    
    db = SessionLocal()
    try:
        init_test_data(db)
    finally:
        db.close()

if __name__ == "__main__":
    init_application()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
