from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user_schema import LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint - authenticates user via AuthService and returns JWT token"""
    user = AuthService.authenticate_user(db, request.email, request.password)
    access_token = AuthService.generate_user_token(user)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get authenticated user profile from verified JWT token"""
    return UserResponse.model_validate(current_user)
