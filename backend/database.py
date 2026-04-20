import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Baca kunci dari .env
load_dotenv("ai_engine/.env")
DATABASE_URL = os.getenv("DATABASE_URL")

# Nyalain mesin penghubung ke PostgreSQL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class buat cetakan tabel kita nanti
Base = declarative_base()
