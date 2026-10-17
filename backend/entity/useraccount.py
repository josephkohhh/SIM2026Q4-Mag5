# useraccount.py - contains the UserAccount model and its database operations

from enum import Enum
from datetime import datetime

from database.database import Base
from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum as SQLEnum,
    DateTime,
    func,
)


# Define Python Enums for PostgreSQL ENUM types
class RoleEnum(str, Enum):
    CUSTOMER = "CUSTOMER"
    INTERIOR_DESIGNER = "INTERIOR DESIGNER"
    ADMIN = "ADMIN"
    PLATFORM_MANAGEMENT = "PLATFORM MANAGEMENT"


class StatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

# useraccount.py - contains the UserAccount model and its database operations

# SQLAlchemy model representing the UserAccount table
class UserAccount(Base):
    __tablename__ = "useraccount"

    user_id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        SQLEnum(RoleEnum, name="user_role"),
        nullable=False,
    )
    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    phone_no = Column(String(30), nullable=False)
    status = Column(
        SQLEnum(StatusEnum, name="user_status"),
        nullable=False,
        default=StatusEnum.ACTIVE,
        server_default="ACTIVE",
    )
    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# UserAccountEntity class responsible for database operations (CRUD)
class UserAccountEntity:

    def __init__(self, db):
        # Database session injected into Entity
        self.db = db

    # CREATE
    def create(self, user_data: dict):
        user = UserAccount(**user_data)

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    # READ: Find user by email
    def get_by_email(self, email: str):
        return (
            self.db.query(UserAccount)
            .filter(UserAccount.email == email)
            .first()
        )

    # UPDATE
    def update(self, user: UserAccount, updates: dict):
        for field, value in updates.items():
            setattr(user, field, value)
            
        user.updated_at = datetime.now()

        self.db.commit()
        self.db.refresh(user)

        return user


    # SUSPEND: Set user account status to INACTIVE
    def suspend(self, user: UserAccount):
        user.status = StatusEnum.INACTIVE
        user.updated_at = datetime.now()

        self.db.commit()
        self.db.refresh(user)

        return user
