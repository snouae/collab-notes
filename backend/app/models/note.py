from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import secrets
from app.db.database import Base

note_tags = Table(
    'note_tags',
    Base.metadata,
    Column('note_id', Integer, ForeignKey('notes.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

note_shares = Table(
    'note_shares',
    Base.metadata,
    Column('note_id', Integer, ForeignKey('notes.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class VisibilityEnum(enum.Enum):
    PRIVATE = "PRIVATE"
    SHARED = "SHARED"
    PUBLIC = "PUBLIC"

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    visibility = Column(Enum(VisibilityEnum), default=VisibilityEnum.PRIVATE)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    public_token = Column(String, unique=True, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="notes")
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")
    shared_with = relationship("User", secondary=note_shares, back_populates="shared_notes")

    @property
    def shared_with_emails(self):
        return [user.email for user in self.shared_with] if self.shared_with else []

    def generate_public_token(self):
        if not self.public_token:
            self.public_token = secrets.token_urlsafe(32)
        return self.public_token

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    notes = relationship("Note", secondary=note_tags, back_populates="tags") 