# suspenduseraccount_control.py

from entity.useraccount import UserAccount, StatusEnum


def suspend_useraccount(db, user_id):

    # Find user account
    user = (
        db.query(UserAccount)
        .filter(UserAccount.user_id == user_id)
        .first()
    )

    # Check whether account exists
    if not user:
        raise LookupError("User account not found")

    # Check whether account is already inactive
    if user.status == StatusEnum.INACTIVE:
        raise ValueError("User account is already suspended")

    # Suspend user account
    user.status = StatusEnum.INACTIVE

    # Save changes
    db.commit()
    db.refresh(user)

    return user
