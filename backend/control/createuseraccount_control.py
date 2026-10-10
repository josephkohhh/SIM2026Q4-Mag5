# createuseraccount_control.py - service for handling user account creation

from entity.useraccount import UserAccount
from utils.security import hash_password

# Create a user
def create_useraccount(db, register_data):

    # Check whether email already exists
    existing_email = (
        db.query(UserAccount)
        .filter(UserAccount.email == register_data.email)
        .first()
    )

    if existing_email:
        raise ValueError("Email already registered")

    # Hash password
    hashed_password = hash_password(register_data.password)

    # Create user entity
    new_user = UserAccount(
        email = register_data.email,
        password_hash = hashed_password,
        role = register_data.role,
        name = register_data.name,
        surname = register_data.surname,
        phone_no = register_data.phone_no
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

