
# jsonwebtoken.py - handles JWT creation and verification

import os
import jwt

from datetime import datetime, timezone, timedelta

SECRET_KEY = os.environ["JWT_SECRET_KEY"]
ALGORITHM = "HS256"


# Create an access token
def create_access_token(name, surname, user_id, role):
    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "name": name,
        "surname": surname,
        "role": role,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# Verify an access token
def verify_access_token(token):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        return payload

    except jwt.InvalidTokenError:
        return None
