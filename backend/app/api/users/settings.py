from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import ProfileUpdate, PasswordUpdate, PreferencesUpdate, AccountDelete, User
from app.services.settings import SettingsService
from typing import Dict, Any

router = APIRouter()

@router.get("/me", response_model=User)
def get_current_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return SettingsService.get_user_settings(db, current_user.id)

@router.put("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    try:
        updated_user = SettingsService.update_profile(db, current_user.id, profile_data)
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": updated_user.id,
                "name": updated_user.name,
                "email": updated_user.email,
                "profile_picture": updated_user.profile_picture,
                "theme": updated_user.theme,
                "language": updated_user.language,
                "email_notifications": updated_user.email_notifications,
                "browser_notifications": updated_user.browser_notifications,
                "created_at": updated_user.created_at,
                "updated_at": updated_user.updated_at
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.put("/password")
def update_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    try:
        SettingsService.update_password(db, current_user.id, password_data)
        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )

@router.put("/preferences")
def update_preferences(
    preferences_data: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    try:
        updated_user = SettingsService.update_preferences(db, current_user.id, preferences_data)
        return {
            "message": "Preferences updated successfully",
            "user": {
                "id": updated_user.id,
                "name": updated_user.name,
                "email": updated_user.email,
                "profile_picture": updated_user.profile_picture,
                "theme": updated_user.theme,
                "language": updated_user.language,
                "email_notifications": updated_user.email_notifications,
                "browser_notifications": updated_user.browser_notifications,
                "created_at": updated_user.created_at,
                "updated_at": updated_user.updated_at
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update preferences"
        )

@router.delete("/account")
def delete_account(
    account_data: AccountDelete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    try:
        SettingsService.delete_user(db, current_user.id, account_data.password)
        return {"message": "Account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        ) 