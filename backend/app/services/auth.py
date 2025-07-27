from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException, status

class AuthService:
    @staticmethod
    def register(db: Session, user_create: UserCreate) -> User:
        existing_user = db.query(User).filter(User.email == user_create.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            name=user_create.name,
            hashed_password=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate(db: Session, user_login: UserLogin) -> User:
        user = db.query(User).filter(User.email == user_login.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not verify_password(user_login.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        return user

    @staticmethod
    def create_token(user: User) -> str:
        return create_access_token(data={"sub": user.email}) 