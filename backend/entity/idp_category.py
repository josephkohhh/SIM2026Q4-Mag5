# idp_category.py - contains the Category model and its database operations

from database.database import Base, session
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


class IdpCategory(Base):
    __tablename__ = "idp_category"

    # Primary key: uniquely identifies each category
    category_id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    # Category code: required and unique
    category_code = Column(
        String(100),
        nullable=False,
        unique=True
    )

    # Description cannot be NULL
    description = Column(Text, nullable=False)


# CategoryEntity class responsible for database operations (CRUD)
class CategoryEntity:

    # READ: Retrieve all categories
    def get_all_idp_categories(self):

        with session() as db:
            try:
                return db.query(IdpCategory).all()
            except SQLAlchemyError:
                db.rollback()
                raise
    # READ: Retrieve a category by its ID
    def get_by_id(self, category_id: int):
        with session() as db:
            try:
                idp_category = (
                    db.query(IdpCategory)
                    .filter(IdpCategory.category_id == category_id)
                    .first()
                )

                # Raise an error if the profile does not exist
                if idp_category is None:
                    raise LookupError("Category not found.")

                return idp_category
        
            except SQLAlchemyError:
                db.rollback()
                raise

    # READ: Retrieve a category by its code
    def get_by_category_code(self, category_code: str):
        if not isinstance(category_code, str) or not category_code.strip():
            raise ValueError("Category code must be a non-empty string.")

        with session() as db:
            try:
                idp_category = (
                    db.query(IdpCategory)
                    .filter(IdpCategory.category_code == category_code.strip())
                    .first()
                )

                # Raise an error if the category does not exist
                if idp_category is None:
                    raise LookupError("Category not found.")

                return idp_category
            
            except SQLAlchemyError:
                db.rollback()
                raise
            
