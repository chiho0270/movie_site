from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from model import User
from schemas import UserCreate, UserResponse, Token
from auth import get_password_hash, authenticate_user, create_access_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()

# 테이블 자동 생성
Base.metadata.create_all(bind=engine)
# OAuth2PasswordBearer: JWT 토큰 인증에 사용
# login 엔드포인트에서 토큰을 발급
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 사용자명 또는 이메일 중복 체크
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user # 비밀번호는 응답에 포함되지 않음
# 로그인 엔드포인트 (JWT 토큰 발급)
@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
     # 사용자 인증 (아이디/비번 확인)
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # JWT 토큰 생성 (username을 payload에 포함)
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# 인증된 사용자 정보 조회
from jose import jwt, JWTError

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
         # 토큰 디코딩 및 payload에서 username 추출
        payload = jwt.decode(token, "your-secret-key-here", algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    # DB에서 사용자 정보 조회
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user
# DB에서 사용자 정보 조회
@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    # JWT 토큰이 올바르면 현재 사용자 정보 반환
    return current_user