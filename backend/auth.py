from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from model import User

# JWT 비밀키
SECRET_KEY = "your-secret-key-her"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
# 비밀번호 해시/검증
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# 비밀번호 해시 함수
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
# 비밀번호 검증 함수
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
# JWT 토큰 생성
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
     # 만료 시간 설정
    expire = datetime.datetime() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # JWT 토큰 생성 및 반환
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
# 사용자 인증 함수: DB에서 사용자 조회 및 비밀번호 검증
def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user