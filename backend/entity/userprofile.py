# userprofile.py - Contains the UserProfile model and database operations

from database.database import Base, session
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


# SQLAlchemy model representing the UserProfile table
class UserProfile(Base):
    __tablename__ = "userprofile"

    # Primary key: uniquely identifies each profile
    profile_id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    # Role must be unique and cannot be NULL
    role = Column(String(100), unique=True, nullable=False)

    # Description cannot be NULL
    description = Column(Text, nullable=False)


# UserProfileEntity class responsible for database operations (CRUD)
class UserProfileEntity:

    # READ: Retrieve all user profiles
    def get_all(self):
        with session() as db:
            try:
                return db.query(UserProfile).all()
            except SQLAlchemyError:
                db.rollback()
                raise

    # READ: Retrieve a user profile by its ID
    def get_by_id(self, profile_id: int):
        with session() as db:
            try:
                user_profile = (
                    db.query(UserProfile)
                    .filter(UserProfile.profile_id == profile_id)
                    .first()
                )

                # Raise an error if the profile does not exist
                if user_profile is None:
                    raise LookupError("User profile not found.")

                return user_profile
        
            except SQLAlchemyError:
                db.rollback()
                raise

    # READ: Retrieve a user profile by its role
    def get_by_role(self, role: str):

        with session() as db:
            try:
                user_profile = (
                    db.query(UserProfile)
                    .filter(UserProfile.role == role.strip())
                    .first()
                )

                # Raise an error if the profile does not exist
                if user_profile is None:
                    raise LookupError("User profile not found.")

                return user_profile
            
            except SQLAlchemyError:
                db.rollback()
                raise


    # CREATE: Create a new user profile
    def create(self, profile_data: dict):
        
        role = profile_data.get("role")
        description = profile_data.get("description")

        with session() as db:
            try:
                # Check for duplicate role
                existing = (
                    db.query(UserProfile)
                    .filter(UserProfile.role == role)
                    .first()
                )

                if existing:
                    raise ValueError("This role already exists.")

                # Create profile
                profile = UserProfile(
                    role=role,
                    description=description
                )

                db.add(profile)
                db.commit()
                db.refresh(profile)

                return {"message": f"User profile {profile.role} has been created successfully."}

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


    # UPDATE: Update an existing user profile
    def update(self, role: str, update_data: dict):

        with session() as db:
            try:
                # Find the profile to update
                user_profile = (
                    db.query(UserProfile)
                    .filter(UserProfile.role == role.strip())
                    .first()
                )

                # Raise an error if the profile does not exist
                if user_profile is None:
                    raise LookupError("User profile not found.")

                # If changing the role, check for duplicates
                if "role" in update_data:
                    existing = (
                        db.query(UserProfile)
                        .filter(
                            UserProfile.role == update_data["role"],
                            UserProfile.role != role
                        )
                        .first()
                    )

                    if existing:
                        raise ValueError("This role already exists.")

                # Apply the supplied changes
                for field, value in update_data.items():
                    setattr(user_profile, field, value)

                # Save changes to the database
                db.commit()
                db.refresh(user_profile)

                return {"message": (f"User profile {user_profile.role} has been updated successfully.")}

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

    # DELETE: Delete an existing user profile
    def delete(self, role: str):

        with session() as db:
            try:
                # Find the user profile to delete
                profile = (
                    db.query(UserProfile)
                    .filter(UserProfile.role == role.strip())
                    .first()
                )

                # Raise an error if the profile does not exist
                if profile is None:
                    raise LookupError("User profile not found.")

                # Delete the profile and save the change
                db.delete(profile)
                db.commit()

                return {"message": "User profile deleted successfully."}

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

