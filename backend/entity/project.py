# project.py - Contains the Project model and database operations

from database.database import Base, session
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Enum as SQLEnum,
    LargeBinary,
    ForeignKey,
    DateTime,
    func
)
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from datetime import datetime 
from enum import Enum

# Define Python Enums for PostgreSQL ENUM types
class StatusEnum(str, Enum):
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# SQLAlchemy model representing the Project table
class Project(Base):
    __tablename__ = "project"

    # Primary key: uniquely identifies each project
    project_id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    # Foreign key referencing the useraccount table
    user_id = Column(
        Integer,
        ForeignKey("useraccount.user_id"),
        nullable=False
    )

    # Foreign key referencing the companyprofile table
    companyprofile_id = Column(
        Integer,
        ForeignKey("companyprofile.companyprofile_id"),
        nullable=False
    )

    project_name = Column(String(150), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    design_details = Column(Text, nullable=False)
    project_image = Column(LargeBinary, nullable=False)
    status = Column(
        SQLEnum(StatusEnum, name="project_status"),
        nullable=False,
        default=StatusEnum.ONGOING,
        server_default="ONGOING",
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


# ProjectEntity class responsible for database operations (CRUD)
class ProjectEntity:

    # READ: Retrieve all projects
    def get_all(self):

        with session() as db:
            try:
                return db.query(Project).all()
            except SQLAlchemyError:
                db.rollback()
                raise

    # READ: Retrieve a project by its name
    def get_by_name(self, project_name: str):
        with session() as db:
            try:
                project = (
                    db.query(Project)
                    .filter(Project.project_name == project_name.strip())
                    .first()
                )

                # Raise an error if the project does not exist
                if project is None:
                    raise LookupError("Project not found.")

                return project
        
            except SQLAlchemyError:
                db.rollback()
                raise

    # CREATE: Create a new project
    def create(self, project_data: dict):

        user_id = project_data.get("user_id")
        companyprofile_id = project_data.get("companyprofile_id")
        project_name = project_data.get("project_name")
        description = project_data.get("description")
        design_details = project_data.get("design_details")
        project_image = project_data.get("project_image")
        status = project_data.get("status", StatusEnum.ONGOING)

        # Create project
        with session() as db:
            try:
                # Check for duplicate project
                existing = (
                    db.query(Project)
                    .filter(Project.project_name == project_name.strip())
                    .first()
                )

                if existing:
                    raise ValueError("This project already exist.")                

                # Create project
                project = Project(
                    user_id=user_id,
                    companyprofile_id=companyprofile_id,
                    project_name=project_name.strip(),
                    description=description,
                    design_details=design_details,
                    project_image=project_image,
                    status=status,
                )

                db.add(project)
                db.commit()
                db.refresh(project)

                return {"message": f"Project {project_name} created successfully."}

            except IntegrityError as e:
                db.rollback()
                raise ValueError(
                    "Database constraint violation. "
                    "Check the user and company profile IDs."
                ) from e

            except SQLAlchemyError as e:
                db.rollback()
                raise RuntimeError(
                    "A database error occurred."
                ) from e

            
    # UPDATE: Update an existing project by project ID
    def update(self, project_name: int, updates: dict):

        with session() as db:
            try:
                project = (
                    db.query(Project)
                    .filter(Project.project_name == project_name)
                    .first()
                )

                if project is None:
                    raise LookupError("Project not found.")

                for field, value in updates.items():

                    # Validate project status
                    if field == "status":
                        if isinstance(value, str):
                            try:
                                value = StatusEnum(value.strip().upper())
                            except ValueError:
                                raise ValueError(
                                    "Invalid project status."
                                ) from None
                        elif not isinstance(value, StatusEnum):
                            raise ValueError(
                                "Status must be a valid project status."
                            )

                    # Validate required text fields
                    if field in {
                        "project_name",
                        "description",
                        "design_details",
                    }:
                        if not isinstance(value, str) or not value.strip():
                            raise ValueError(
                                f"{field} must be a non-empty string."
                            )

                        value = value.strip()

                    setattr(project, field, value)

                project.updated_at = datetime.now()

                db.commit()
                db.refresh(project)

                return {"message": f"Project {project_name} has been updated successfully."}

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


    # DELETE: Delete an existing project
    def delete(self, project_name: str):

        with session() as db:
            try:
                # Find the project name first
                project = (
                    db.query(Project)
                    .filter(Project.project_name == project_name.strip())
                    .first()
                )

                if project is None:
                    raise LookupError("Project not found.")

                # Delete project
                db.delete(project)
                db.commit()

                return {"message": f"Project {project_name} deleted successfully."}

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
