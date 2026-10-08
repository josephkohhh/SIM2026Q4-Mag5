# database.py - db connection setup (SQLAlchemy engine & session)

from dotenv import load_dotenv # pip install python-dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()  # Load .env file
db_url = os.getenv('DATABASE_URL')
engine = create_engine(db_url) # To tell app where and how to connect to db
session = sessionmaker(autocommit=False,autoflush=True,bind=engine) # To connect to db

Base = declarative_base() # Instantiate base class

# creates a db dession
def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()