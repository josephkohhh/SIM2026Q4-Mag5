# favorite.py - contains the Favorite model and its database operations

from database.database import Base, session
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.sql import func
from sqlalchemy import cast,Date,text



class Favorite(Base):
    __tablename__ = "favorite"

    # Prevent a customer from saving the same project more than once
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "project_id",
            name="unique_user_project"
        ),
    )

    # Primary key: uniquely identifies each favorite record
    favourite_id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    # Foreign key: identifies the customer who saved the project
    user_id = Column(
        Integer,
        ForeignKey("useraccount.user_id", ondelete="CASCADE"),
        nullable=False
    )

    # Foreign key: identifies the saved project
    project_id = Column(
        Integer,
        ForeignKey("project.project_id", ondelete="CASCADE"),
        nullable=False
    )

    # Automatically records when the project was saved
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )


# FavoriteEntity class responsible for database operations (CRUD)
class FavoriteEntity:

# READ: Retrieve total shortlists and daily shortlists
    def get_count(self, project_id: int):

     with session() as db:
        try:
            
            customer_only = text("""
                    EXISTS (
                        SELECT 1
                        FROM useraccount AS u
                        WHERE u.user_id = favorite.user_id
                        AND LOWER(CAST(u.role AS TEXT)) = 'customer'
                    )
                """)

            # Get total shortlists
            count = (
                db.query(func.count(Favorite.favourite_id))
                .filter(
                    Favorite.project_id == project_id,
                    customer_only
                )
                .scalar()
            )

            # Group shortlists by date
            shortlist_date = cast(Favorite.created_at, Date)

            daily_shortlists = (
                db.query(
                    shortlist_date.label("date"),
                    func.count(Favorite.favourite_id).label("shortlists")
                )
                .filter(
                    Favorite.project_id == project_id,
                    customer_only
                )
                .group_by(shortlist_date)
                .order_by(shortlist_date)
                .all()
            )

            return {
                "shortlist_count": count,
                "daily_shortlists": [
                    {
                        "date": row.date.isoformat(),
                        "shortlists": row.shortlists
                    }
                    for row in daily_shortlists
                ]
            }

        except SQLAlchemyError:
            db.rollback()
            raise

    # READ: Retrieve all saved projects belonging to a customer
    def get_all(self, user_id: int):

        with session() as db:
            try:
                favorites = (
                    db.query(Favorite)
                    .filter(Favorite.user_id == user_id)
                    .order_by(Favorite.created_at.desc())
                    .all()
                )

                if not favorites:
                    return {
                        "message": "You favorite list is empty."
                    }

                return favorites

            except SQLAlchemyError:
                db.rollback()
                raise


    # SAVE: Save a project to a customer's favorites
    def save(self, user_id: int, project_id: int):

        with session() as db:
            try:
                # Check whether the user is a customer
                customer_role = db.execute(
                    text("""
                        SELECT role
                        FROM useraccount
                        WHERE user_id = :user_id
                    """),
                    {"user_id": user_id}
                ).scalar()

                if not customer_role or str(customer_role).lower() != "customer":
                    raise ValueError(
                        "Only customers can shortlist projects."
                    )

                # Check whether the project is already saved
                existing = (
                    db.query(Favorite)
                    .filter(
                        Favorite.user_id == user_id,
                        Favorite.project_id == project_id
                    )
                    .first()
                )

                if existing:
                    raise ValueError(
                        "Project is already in your favorites."
                    )

                # Create a new favorite record
                favorite = Favorite(
                    user_id=user_id,
                    project_id=project_id
                )

                db.add(favorite)
                db.commit()
                db.refresh(favorite)

                return {
                    "message": "Project added to favorites successfully."
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

    # DELETE: Remove a favorite by favorite ID
    def delete(self, favourite_id: int):

        with session() as db:
            try:
                favorite = (
                    db.query(Favorite)
                    .filter(
                        Favorite.favourite_id == favourite_id
                    )
                    .first()
                )

                if favorite is None:
                    raise LookupError("Favorite not found.")

                db.delete(favorite)
                db.commit()

                return {"message": ("Removed successfully.")}

            except SQLAlchemyError as e:
                db.rollback()
                raise RuntimeError(
                    "A database error occurred."
                ) from e