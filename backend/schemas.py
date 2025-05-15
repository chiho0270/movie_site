from pydantic import BaseModel, EmailStr
#데이터 구조와 타입 명확
# 회원가입 요청
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
# 사용자 응답
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool

    class Config:
        orm_mode = True
# JWT 토큰 응답
class Token(BaseModel):
    access_token: str
    token_type: str