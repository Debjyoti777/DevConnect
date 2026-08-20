import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import URL


DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username="postgres",
    password="djtherock@99",
    host=os.getenv("DB_HOST", "localhost"),    port=5432,
    database="devconnect_db"
)

engine = create_engine(DATABASE_URL)

Base = declarative_base()

with engine.connect() as connection:
    print("Database connected successfully!")

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()