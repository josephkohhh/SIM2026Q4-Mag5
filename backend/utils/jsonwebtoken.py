# jsonwebtoken.py - handles JWT creation and verification

import os
import jwt

from datetime import datetime, timezone

SECRET_KEY = os.environ["JWT_SECRET_KEY"]
ALGORITHM = "HS256"

# create an access token
def create_access_token(user_id, role):
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": datetime.now(timezone.utc), # meaning = issuedAt 
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm="HS256",
    )


# verify an access token 
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
