# create_project_boundary.py - boundary for ID to create project

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from control.create_project_control import CreateProjectControl

router = APIRouter()

# Initialise the controller object
create_project_control = CreateProjectControl()

# Create project endpoint
@router.post("/create_project")
async def create_project( 
    user_id: int = Form(...),
    companyprofile_id: int = Form(...),
    project_name: str = Form(...),
    description: str = Form(...),
    category_code: str = Form(...),
    project_image: UploadFile = File(...),
    status: str = Form(default="ONGOING"),):
        
    try:
        # Validate image format
        allowed_types = {"image/jpeg", "image/png"}

        if project_image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG and PNG images are allowed."
            )

        # Read the images into bytes
        image_bytes = await project_image.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )
        
        project_data = {
            "user_id": user_id,
            "companyprofile_id": companyprofile_id,
            "project_name": project_name,
            "description": description,
            "category_code": category_code,
            "project_image": image_bytes,
            "status": status,
        }

        # Call the controller method
        return create_project_control.create_project(project_data)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error

    finally:
        await project_image.close()