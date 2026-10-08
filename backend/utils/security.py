# security.py - Password hashing and verification

from pwdlib import PasswordHash

password_hash = PasswordHash.recommended() # creates a PasswordHash obj

# hash a plain-text password
def hash_password(password):
    return password_hash.hash(password)

# verify a plain-text password against a stored password hash
def verify_password(password, hashed_password):
    return password_hash.verify(password, hashed_password) 

