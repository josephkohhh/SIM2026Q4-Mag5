# userprofile.py - contains the UserProfile model and its database operations

from database.database import Base
from sqlalchemy import Column, Integer, String, Text


# SQLAlchemy model representing the UserProfile table
class UserProfile(Base):
    __tablename__ = "userprofile"

    profile_id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    role = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)



# UserProfileEntity class responsible for database operations (CRUD)
class UserProfileEntity:

    def __init__(self, db):
        # Database session injected into Entity
        self.db = db

    # CREATE
    def create(self, profile_data: dict):
        profile = UserProfile(**profile_data)

        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)

        return profile

    # READ: Find profile by role
    def get_by_id(self, id: int):
        return (
            self.db.query(UserProfile)
            .filter(UserProfile.profile_id == id)
            .first()
        )

    # READ: Find profile by role
    def get_by_role(self, role: str):
        return (
            self.db.query(UserProfile)
            .filter(UserProfile.role == role)
            .first()
        )

    # READ: Get all user profiles
    def get_all(self):
        return self.db.query(UserProfile).all()

    # UPDATE
    def update(self, profile: UserProfile, updates: dict):
        for field, value in updates.items():
            setattr(profile, field, value)

        self.db.commit()
        self.db.refresh(profile)

        return profile

    # DELETE
    def delete(self, profile: UserProfile):
        self.db.delete(profile)
        self.db.commit()
