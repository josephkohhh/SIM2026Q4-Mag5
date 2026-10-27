# update_project_boundary.py - boundary for ID to update project

from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from control.update_project_control import UpdateProjectControl

router = APIRouter()

# Initialise the controller object
update_project_control = UpdateProjectControl()

# Update category endpoint
@router.patch("/update_project")
async def update_project(
    project_name: str | None = Form(default=None),
    description: str | None = Form(default=None),
    category_code: str | None = Form(default=None),
    status: str | None = Form(default=None),
    project_image: UploadFile | None = File(default=None),
):
        # Build updates using only the fields provided
    updates = {}

    if project_name is not None:
        updates["project_name"] = project_name
    if description is not None:
        updates["description"] = description
    if category_code is not None:
        updates["category_code"] = category_code
    if status is not None:
        updates["status"] = status

    if project_image is not None:
        try:
            allowed_types = {"image/jpeg", "image/png"}

            if project_image.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400,
                    detail="Only JPEG and PNG images are allowed."
                )

            image_bytes = await project_image.read()

            if not image_bytes:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded image is empty."
                )

            updates["project_image"] = image_bytes
        finally:
            await project_image.close()

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update."
        )

    try:
        # Call th controller method
        return update_project_control.update_project(project_name, updates)
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

