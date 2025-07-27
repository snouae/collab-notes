from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, User, Token
from app.services.auth import AuthService
from app.core.deps import get_current_active_user
from app.models.user import User as UserModel

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register(
    user_create: UserCreate,
    db: Session = Depends(get_db)
):
    return AuthService.register(db, user_create)

@router.post("/login", response_model=Token)
def login(
    user_login: UserLogin,
    db: Session = Depends(get_db)
):
    user = AuthService.authenticate(db, user_login)
    access_token = AuthService.create_token(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=User)
def get_current_user_info(
    current_user: UserModel = Depends(get_current_active_user)
):
    return current_user 