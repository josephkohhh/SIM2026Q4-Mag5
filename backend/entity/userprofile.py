# userprofile.py - representing the User profile stored in the database

from database.database import Base
from sqlalchemy import Column, Integer, String, Text


class UserProfile(Base):
    __tablename__ = "userprofile"

    profile_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)

