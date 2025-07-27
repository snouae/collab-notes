from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    profile_picture = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    theme = Column(String, default="system")
    language = Column(String, default="fr")
    
    email_notifications = Column(Boolean, default=True)
    browser_notifications = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")
    shared_notes = relationship("Note", secondary="note_shares", back_populates="shared_with") 