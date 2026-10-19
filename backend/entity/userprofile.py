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
        if not isinstance(role, str) or not role.strip():
            raise ValueError("Role must be a non-empty string.")

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
    def create_userprofile(self, profile_data: dict):

        if not isinstance(profile_data, dict):
            raise ValueError("Profile data must be a dictionary.")
        
        role = profile_data.get("role")
        description = profile_data.get("description")

        if not isinstance(role, str) or not role.strip():
            raise ValueError("Role must be a non-empty string.")
        
        role = role.strip()

        if len(role) > 100:
            raise ValueError("Role cannot exceed 100 characters.")

        if not isinstance(description, str) or not description.strip():
            raise ValueError("Description must be a non-empty string.")

        description = description.strip()

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
    def update_userprofile(self, profile_id: int, update_data: dict):

        if not isinstance(update_data, dict):
            raise ValueError("Update data must be a dictionary.")
        
        # Only allow these fields to be updated
        allowed_fields = {"role", "description"}

        # Reject fields that are not allowed
        if not update_data or not set(update_data).issubset(allowed_fields):
             raise ValueError("Invalid or empty update fields.")

        update_data = update_data.copy()

        # Validate new role
        if "role" in update_data:
            role = update_data["role"]

            if not isinstance(role, str) or not role.strip():
                 raise ValueError("Role must be a non-empty string.")

            role = role.strip()

            if len(role) > 100:
                raise ValueError("Role cannot exceed 100 characters.")

            update_data["role"] = role

        # Validate description
        if "description" in update_data:
            description = update_data["description"]

            if not isinstance(description, str) or not description.strip():
                raise ValueError("Description must be a non-empty string.")

            update_data["description"] = description.strip()

        with session() as db:
            try:
                # Find the profile to update
                user_profile = (
                    db.query(UserProfile)
                    .filter(UserProfile.profile_id == profile_id)
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
                            UserProfile.profile_id != profile_id
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
    def delete_userprofile(self, role: str):

        if not isinstance(role, str) or not role.strip():
            raise ValueError("Role must be a non-empty string.")

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

