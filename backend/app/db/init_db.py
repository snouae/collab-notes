from sqlalchemy.orm import Session
from app.db.database import engine, Base
from app.models import user, note

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database tables created successfully!") 