# idpcategory.py - contains the Category model and its database operations

from database.database import Base, session
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


class IdpCategory(Base):
    __tablename__ = "idpcategory"

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
class IdpCategoryEntity:

    # READ: Retrieve all categories
    def get_all(self):

        with session() as db:
            try:
                return db.query(IdpCategory).all()
            except SQLAlchemyError:
                db.rollback()
                raise
            
    # READ: Retrieve a category by its code
    def get_by_code(self, category_code: str):
        with session() as db:
            try:
                idp_category = (
                    db.query(IdpCategory)
                    .filter(IdpCategory.category_code == category_code.strip())
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
            
    # CREATE: Create a new category
    def create(self, category_data: dict):   

        category_code = category_data.get("category_code")
        description = category_data.get("description")

        with session() as db:
            try:
                # Check for duplicate category code
                existing = (
                    db.query(IdpCategory)
                    .filter(IdpCategory.category_code == category_code)
                    .first()
                )

                if existing:
                    raise ValueError("Category code already exists.")

                # Create category
                category = IdpCategory(
                    category_code=category_code,
                    description=description
                )

                db.add(category)
                db.commit()
                db.refresh(category)

                return {
                    "message": (
                        f"Category {category.category_code} "
                        "created successfully."
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

    # UPDATE: Update an existing category by ID
    def update(self, category_code: str, updates: dict):

        with session() as db:
            try:
                # Find the category code first
                category = (
                    db.query(IdpCategory)
                    .filter(IdpCategory.category_code == category_code.strip())
                    .first()
                )

                if category is None:
                    raise LookupError("Category not found.")

                # Apply the updates
                for field, value in updates.items():
                    if not isinstance(value, str) or not value.strip():
                        raise ValueError(
                            f"{field} must be a non-empty string."
                        )

                    value = value.strip()

                    # Check duplicate category code
                    if field == "category_code":
                        existing = (
                            db.query(IdpCategory)
                            .filter(
                                IdpCategory.category_code == value,
                                IdpCategory.category_id != category.category_id
                            )
                            .first()
                        )

                        if existing:
                            raise ValueError(
                                "Category code already exists."
                            )

                    setattr(category, field, value)

                db.commit()
                db.refresh(category)

                return {
                    "message": (
                        f"Category {category.category_code} "
                        "updated successfully."
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

    # DELETE: Delete an existing category by ID
    def delete(self, category_code: str):

        with session() as db:
            try:
                # Find the category code first
                category = (
                    db.query(IdpCategory)
                    .filter(IdpCategory.category_code == category_code.strip())
                    .first()
                )

                if category is None:
                    raise LookupError("Category not found.")

                # Delete category
                db.delete(category)
                db.commit()

                return {
                    "message": (
                        f"Category {category.category_code} "
                        "deleted."
                    )
                }

            except IntegrityError as e:
                db.rollback()
                raise ValueError(
                    "Cannot delete category because it is referenced "
                    "by other records."
                ) from e

            except SQLAlchemyError as e:
                db.rollback()
                raise RuntimeError(
                    "A database error occurred."
                ) from e
