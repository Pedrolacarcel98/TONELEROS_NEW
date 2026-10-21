from sqlalchemy.orm import Session
from datetime import timedelta
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.core.config import settings

class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña inválidos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    @staticmethod
    def generate_user_token(user: User) -> str:
        expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return create_access_token(
            data={"sub": str(user.id)},
            expires_delta=expires
        )
