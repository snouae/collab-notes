from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_picture: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    email_notifications: Optional[bool] = None
    browser_notifications: Optional[bool] = None

class User(UserBase):
    id: int
    profile_picture: Optional[str] = None
    theme: str = "system"
    language: str = "fr"
    email_notifications: bool = True
    browser_notifications: bool = True
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_picture: Optional[str] = None

class PreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    email_notifications: Optional[bool] = None
    browser_notifications: Optional[bool] = None

class AccountDelete(BaseModel):
    password: str 