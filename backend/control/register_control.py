# register_control.py - service for handling user registration

from entity.user import User
from utils.security import hash_password

# Register a user
def register_user(db, register_data):

    # Check whether email already exists
    existing_email = (
        db.query(User)
        .filter(User.email == register_data.email)
        .first()
    )

    if existing_email:
        raise ValueError("Email already registered")

    # Hash password
    hashed_password = hash_password(register_data.password)

    # Create user entity
    new_user = User(
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

