from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "postgresql://사용자명:비밀번호@호스트:포트/DB이름"

engine = create_engine(SQLALCHEMY_DATABASE_URL) #엔진 생성: DB와 연결을 관리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #각 요청마다 독립적인 DB 세션을 제공
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()