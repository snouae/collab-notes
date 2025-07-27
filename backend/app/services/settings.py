from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserUpdate, PasswordUpdate, ProfileUpdate, PreferencesUpdate
from app.core.security import verify_password, get_password_hash
from fastapi import HTTPException, status
from typing import Optional

class SettingsService:
    @staticmethod
    def update_profile(db: Session, user_id: int, profile_data: ProfileUpdate) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if profile_data.email and profile_data.email != user.email:
            existing_user = db.query(User).filter(User.email == profile_data.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        if profile_data.name is not None:
            user.name = profile_data.name
        if profile_data.email is not None:
            user.email = profile_data.email
        if profile_data.profile_picture is not None:
            user.profile_picture = profile_data.profile_picture
        
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_password(db: Session, user_id: int, password_data: PasswordUpdate) -> bool:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not verify_password(password_data.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        user.hashed_password = get_password_hash(password_data.new_password)
        db.commit()
        return True

    @staticmethod
    def update_preferences(db: Session, user_id: int, preferences_data: PreferencesUpdate) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if preferences_data.theme is not None:
            if preferences_data.theme not in ["light", "dark", "system"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid theme value"
                )
            user.theme = preferences_data.theme
        
        if preferences_data.language is not None:
            if preferences_data.language not in ["fr", "en"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid language value"
                )
            user.language = preferences_data.language
        
        if preferences_data.email_notifications is not None:
            user.email_notifications = preferences_data.email_notifications
        
        if preferences_data.browser_notifications is not None:
            user.browser_notifications = preferences_data.browser_notifications
        
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_settings(db: Session, user_id: int) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int, password: str) -> bool:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is incorrect"
            )
        
        try:
            for note in user.shared_notes:
                if user in note.shared_with:
                    note.shared_with.remove(user)
            
            db.delete(user)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete user: {str(e)}"
            ) 