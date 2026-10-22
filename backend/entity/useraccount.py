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
from utils.security import hash_password, verify_password
from utils.jsonwebtoken import create_access_token

# Define Python Enums for PostgreSQL ENUM types
class RoleEnum(str, Enum):
    CUSTOMER = "CUSTOMER"
    INTERIOR_DESIGNER = "INTERIOR DESIGNER"
    ADMIN = "ADMIN"
    PLATFORM_MANAGEMENT = "PLATFORM MANAGEMENT"


class StatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


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

    # LOGIN: Authenticate a user account
    def login(self, login_data: dict):

        email = login_data.get("email")
        password = login_data.get("password")

        # Retrieve user account by email
        try:
            user = self.get_by_email(email)

        except LookupError:
            raise ValueError(
                "Invalid email or password."
            ) from None

        # Check if account is active
        if user.status != StatusEnum.ACTIVE:
            raise ValueError("Account has been suspended.")

        # Verify password
        if not verify_password(password, user.password_hash):
            raise ValueError(
                "Invalid email or password."
            )

        # Generate access token after successful validation
        access_token = create_access_token(
            user.user_id,
            user.role.value
        )

        return {
            "message": f"Welcome {user.name}!",
            "access_token": access_token
        }


    # READ: Retrieve a user account by email
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

        email = user_data.get("email")
        password = user_data.get("password")
        role = user_data.get("role")
        name = user_data.get("name")
        surname = user_data.get("surname")
        phone_no = user_data.get("phone_no")

        # Validate role
        if isinstance(role, str):
            try:
                role = RoleEnum(role.strip())
            except ValueError:
                raise ValueError("Invalid user role.") from None
        elif not isinstance(role, RoleEnum):
            raise ValueError("Role must be a valid user role.")

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
    def suspend(self, email: str):
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
                


   
