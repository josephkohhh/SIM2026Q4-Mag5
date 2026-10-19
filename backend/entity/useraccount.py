# useraccount.py - contains the UserAccount model and its database operations

from database.database import Base, session
from datetime import datetime
from enum import Enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum as SQLEnum,
    DateTime,
    func,
)
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from utils.security import hash_password

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

    # READ: Find a user account by email
    def get_by_email(self, email: str):
        with session() as db:
            try:
                user_account = (
                db.query(UserAccount)
                .filter(UserAccount.email == email)
                .first()
                )

                # Raise an error if the account does not exist
                if user_account is None:
                    raise LookupError("User account not found.")

                return user_account

            except SQLAlchemyError:
                db.rollback()
                raise
  
 
    # CREATE: Create a new user account
    def create(self, user_data: dict):

        # Validate input
        if not isinstance(user_data, dict):
            raise ValueError("User data must be a dictionary.")

        required_fields = {
            "email",
            "password",
            "role",
            "name",
            "surname",
            "phone_no"
        }

        if not required_fields.issubset(user_data):
            raise ValueError("All required user account fields must be provided.")

        email = user_data.get("email")
        password = user_data.get("password")
        role = user_data.get("role")
        name = user_data.get("name")
        surname = user_data.get("surname")
        phone_no = user_data.get("phone_no")

        # Validate email
        if not isinstance(email, str) or not email.strip():
            raise ValueError("Email must be a non-empty string.")

        email = email.strip()

        if len(email) > 255:
            raise ValueError("Email cannot exceed 255 characters.")

        # Validate password
        if not isinstance(password, str) or not password:
            raise ValueError("Password must be a non-empty string.")

        # Validate role
        if isinstance(role, str):
            try:
                role = RoleEnum(role.strip())
            except ValueError:
                raise ValueError("Invalid user role.") from None
        elif not isinstance(role, RoleEnum):
            raise ValueError("Role must be a valid user role.")

        # Validate name
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Name must be a non-empty string.")

        name = name.strip()

        if len(name) > 100:
            raise ValueError("Name cannot exceed 100 characters.")

        # Validate surname
        if not isinstance(surname, str) or not surname.strip():
            raise ValueError("Surname must be a non-empty string.")

        surname = surname.strip()

        if len(surname) > 100:
            raise ValueError("Surname cannot exceed 100 characters.")

        # Validate phone number
        if not isinstance(phone_no, str) or not phone_no.strip():
            raise ValueError("Phone number must be a non-empty string.")

        phone_no = phone_no.strip()

        if len(phone_no) > 30:
            raise ValueError("Phone number cannot exceed 30 characters.")

        # Hash the password before storing it
        hashed_password = hash_password(password)

        with session() as db:
            try:
                # Check for duplicate email
                existing = (
                    db.query(UserAccount)
                    .filter(UserAccount.email == email)
                    .first()
                )

                if existing:
                    raise ValueError("This email is already registered.")

                # Create user account
                user = UserAccount(
                    email=email,
                    password_hash=hashed_password,
                    role=role,
                    name=name,
                    surname=surname,
                    phone_no=phone_no
                )

                db.add(user)
                db.commit()
                db.refresh(user)

                return {
                    "message": (
                        f"User account {user.email} "
                        "has been created successfully."
                    )
                }

            except IntegrityError as e:
                db.rollback()
                raise ValueError(
                    "Database constraint violation."
                ) from e

            except SQLAlchemyError as e:
                db.rollback()
                raise RuntimeError(
                    "A database error occurred."
                ) from e

    # UPDATE: Update an existing user account by email
    def update(self, email: str, updates: dict):

        if not isinstance(email, str) or not email.strip():
            raise ValueError("Email must be a non-empty string.")

        if not isinstance(updates, dict):
            raise ValueError("Update data must be a dictionary.")

        if not updates:
            raise ValueError("Update data cannot be empty.")

        # Only allow these fields to be updated
        allowed_fields = {
            "name",
            "surname",
            "password",
            "role",
            "phone_no",
            "status",
        }

        if not set(updates).issubset(allowed_fields):
            raise ValueError("Invalid update fields.")

        with session() as db:
            try:
                # Find the account by email first
                user = (
                    db.query(UserAccount)
                    .filter(UserAccount.email == email.strip())
                    .first()
                )

                if user is None:
                    raise LookupError("User account not found.")

                # Apply the updates
                for field, value in updates.items():
                    if field == "password":
                        if not isinstance(value, str) or not value:
                            raise ValueError(
                                "Password must be a non-empty string."
                            )

                        user.password = hash_password(value)
                    else:
                        setattr(user, field, value)

                user.updated_at = datetime.now()

                db.commit()
                db.refresh(user)

                return {
                    "message": (
                        f"User account {user.email} "
                        "has been updated successfully."
                    )
                }

            except IntegrityError as e:
                db.rollback()
                raise ValueError(
                    "Database constraint violation."
                ) from e

            except SQLAlchemyError as e:
                db.rollback()
                raise RuntimeError(
                    "A database error occurred."
                ) from e

    # SUSPEND: Set user account status to INACTIVE
    def suspend_useraccount(self, email: str):
        with session() as db:
            try:
                # Find the user account to suspend
                account = (
                    db.query(UserAccount)
                    .filter(UserAccount.email == email)
                    .first()
                )

                # Raise an error if the user account does not exist
                if account is None:
                    return {"error": "User account not found."}

                # Suspend the account
                account.status = StatusEnum.INACTIVE
                account.updated_at = datetime.now()

                db.commit()
                db.refresh(account)

                return {"message": (f"User account {account.email} has been suspended.")}

            except SQLAlchemyError as e:
                db.rollback()
                raise RuntimeError( "A database error occurred.") from e
                


   
