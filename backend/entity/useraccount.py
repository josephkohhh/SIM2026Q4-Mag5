# user.py - User entity representing the User table stored in the database

from enum import Enum
from database.database import Base
from sqlalchemy import Column, Integer, String, Enum as SQLEnum, DateTime, func # Column and datatypes

# Define Python Enums for PostgreSQL ENUM types
class RoleEnum(str, Enum):
    CUSTOMER = "CUSTOMER"
    INTERIOR_DESIGNER = "INTERIOR DESIGNER"
    ADMIN = "ADMIN"
    PLATFORM_MANAGEMENT = "PLATFORM MANAGEMENT"

class StatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class UserAccount(Base):
    __tablename__ = "useraccount"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(RoleEnum, name="user_role"), nullable=False) # Enums
    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    phone_no = Column(String(30), nullable=False)

    # Status with default ACTIVE
    status = Column(
        SQLEnum(StatusEnum, name="user_status"), 
        nullable=False, 
        default=StatusEnum.ACTIVE, 
        server_default="ACTIVE"
    )

    # Automatic timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)