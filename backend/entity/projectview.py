# projectview.py - contains the Favorite model and its database operations

from database.database import Base, session
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.sql import func

class ProjectView(Base):
    __tablename__ = "projectview"

    # Primary key: uniquely identifies each category
    view_id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    # Foreign key: identifies the project who was viewed by the customer
    project_id = Column(
        Integer,
        ForeignKey("project.project_id", ondelete="CASCADE"),
        nullable=False
    )

    # Foreign key: identifies the customer who viewed the project
    user_id = Column(
        Integer,
        ForeignKey("useraccount.user_id", ondelete="CASCADE"),
        nullable=False
    )

    # Automatically records the view datetime
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

# ProjectViewEntity class responsible for database operations (CRUD)
class ProjectViewEntity:

    # CREATE: Record a project view
    def create_view(self, project_id: int, user_id: int):

        with session() as db:
            try:
                view = ProjectView(
                    project_id=project_id,
                    user_id=user_id
                )

                db.add(view)
                db.commit()
                db.refresh(view)

            except SQLAlchemyError:
                db.rollback()
                raise

    # READ: Retrieve the total no of views for a project
    def get_view_count(self, project_id: int):

        with session() as db:
            try:
                count = (
                    db.query(func.count(ProjectView.view_id))
                    .filter(ProjectView.project_id == project_id)
                    .scalar()
                )

                return {
                    "view_count": count
                }

            except SQLAlchemyError:
                db.rollback()
                raise


