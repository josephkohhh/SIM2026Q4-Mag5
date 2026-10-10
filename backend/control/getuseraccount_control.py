# getuseraccount_control.py - retrieve user account details

from entity.useraccount import UserAccount


def get_useraccount_by_id(db, user_id):

    # Find user account by ID
    user = (
        db.query(UserAccount)
        .filter(UserAccount.user_id == user_id)
        .first()
    )

    # Check whether account exists
    if not user:
        raise LookupError("User account not found")

    return user
