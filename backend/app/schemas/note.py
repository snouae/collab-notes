from pydantic import BaseModel, computed_field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class VisibilityEnum(str, Enum):
    PRIVATE = "PRIVATE"
    SHARED = "SHARED"
    PUBLIC = "PUBLIC"

class TagBase(BaseModel):
    name: str

class Tag(TagBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    visibility: VisibilityEnum = VisibilityEnum.PRIVATE
    tags: List[str] = []

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    visibility: Optional[VisibilityEnum] = None
    tags: Optional[List[str]] = None

class Note(NoteBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[Tag] = []
    shared_with: Optional[List[str]] = None
    public_token: Optional[str] = None

    class Config:
        from_attributes = True
        
    @computed_field
    @property
    def shared_with_emails(self) -> Optional[List[str]]:
        if hasattr(self, '_shared_with_users') and self._shared_with_users:
            return [user.email for user in self._shared_with_users]
        return self.shared_with or []

class NoteShare(BaseModel):
    user_email: str

class PublicNote(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    visibility: VisibilityEnum
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[Tag] = []
    public_token: str

    class Config:
        from_attributes = True

class PublicLinkResponse(BaseModel):
    public_url: str
    public_token: str 