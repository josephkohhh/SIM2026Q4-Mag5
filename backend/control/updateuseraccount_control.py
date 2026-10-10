# updateuseraccount_control.py

from entity.useraccount import UserAccount, RoleEnum, StatusEnum
from utils.security import hash_password


def update_useraccount(db, user_id, update_data):

    # Find existing user account
    user = (
        db.query(UserAccount)
        .filter(UserAccount.user_id == user_id)
        .first()
    )

    if not user:
        raise LookupError("User account not found")

    # Get only fields provided by the user admin
    update_fields = update_data.model_dump(exclude_unset=True)

    if not update_fields:
        raise ValueError("No fields provided for update")

    for field, value in update_fields.items():

        if field == "password":
            if not value:
                raise ValueError("Password cannot be empty")

            user.password_hash = hash_password(value)

        elif field == "role":
            user.role = RoleEnum(value)

        elif field == "status":
            user.status = StatusEnum(value)

        else:
            setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user
