from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

class LoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX, description="User email address")
    password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: int
    email: str = Field(..., pattern=EMAIL_REGEX)
    
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
