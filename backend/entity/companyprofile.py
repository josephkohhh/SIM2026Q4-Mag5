# companyprofile.py - Contains the CompanyProfile model and database operations

from database.database import Base, session
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    Enum as SQLEnum,
    DateTime,
    func,
)
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from enum import Enum


# Define Python Enum for company profile status
class CompanyProfileStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


# SQLAlchemy model representing the CompanyProfile table
class CompanyProfile(Base):
    __tablename__ = "companyprofile"

    # Primary key: uniquely identifies each company profile
    companyprofile_id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    # Foreign key: links profile to a user account
    # Each user can have only one company profile
    user_id = Column(
        Integer,
        ForeignKey("useraccount.user_id"),
        unique=True,
        nullable=False
    )

    company_name = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    phone_no = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
    status = Column(
        SQLEnum(
            CompanyProfileStatusEnum,
            name="companyprofile_status"
        ),
        nullable=False,
        default=CompanyProfileStatusEnum.ACTIVE,
        server_default="ACTIVE"
    )
    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


# CompanyProfileEntity class responsible for database operations (CRUD)
class CompanyProfileEntity:

    # READ: Retrieve a company profile by user ID
    def get_by_id(self, user_id: int):

        with session() as db:
            try:
                company_profile = (
                    db.query(CompanyProfile)
                    .filter(CompanyProfile.user_id == user_id)
                    .first()
                )

                # Check if the profile exists
                if company_profile is None:
                    return {"message": "No Company profile."}

                return company_profile

            except SQLAlchemyError:
                db.rollback()
                raise

    # CREATE: Create a new company profile
    def create(self, company_data: dict):

        with session() as db:
            try:
                # Check for an existing company profile
                existing = (
                    db.query(CompanyProfile)
                    .filter(CompanyProfile.user_id == company_data.get("user_id"))
                    .first()
                )

                if existing:
                    raise ValueError(
                        "You already have a company profile."
                    )

                # Create company profile
                profile = CompanyProfile(
                    user_id=company_data.get("user_id"),
                    company_name=company_data.get("company_name"),
                    description=company_data.get("description"),
                    phone_no=company_data.get("phone_no"),
                    address=company_data.get("address")
                )

                db.add(profile)
                db.commit()
                db.refresh(profile)

                return {"message": 'Company profile created successfully.'}

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

    # UPDATE: Update an existing company profile by user ID
    def update(self, user_id: int, update_data: dict):

        with session() as db:
            try:
                # Find the company profile by user ID
                company_profile = (
                    db.query(CompanyProfile)
                    .filter(CompanyProfile.user_id == user_id)
                    .first()
                )

                # Raise an error if the profile does not exist
                if company_profile is None:
                    raise LookupError(
                        "Company profile not found."
                    )

                # Apply the supplied changes
                for field, value in update_data.items():
                    setattr(company_profile, field, value)

                company_profile.updated_at = datetime.now()

                # Save changes to the database
                db.commit()
                db.refresh(company_profile)

                return {"message": "Company profile updated successfully."}

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

    # SUSPEND: Set company profile status to INACTIVE
    def suspend(self, user_id: int):

        with session() as db:
            try:
                # Find the company profile by user ID
                company_profile = (
                    db.query(CompanyProfile)
                    .filter(CompanyProfile.user_id == user_id)
                    .first()
                )

                if company_profile is None:
                    raise LookupError(
                        "You have no Company profile"
                    )

                # Suspend the company profile
                company_profile.status = (
                    CompanyProfileStatusEnum.INACTIVE
                )

                company_profile.updated_at = datetime.now()

                db.commit()
                db.refresh(company_profile)

                return {"message":"Company profile hidden successfully."}

            except SQLAlchemyError:
                db.rollback()
                raise


