import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Safely extract and encode the password configuration layout metrics
raw_password = "Ashoknagar"
encoded_password = urllib.parse.quote_plus(raw_password)

# Explicitly use the clean, encoded local URL parameter layout rule
DATABASE_URL = f"postgresql://postgres:{encoded_password}@127.0.0.1:5432/sih26003_dev"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Expose core structural layout maps to ensure Alembic auto-generates tables cleanly

