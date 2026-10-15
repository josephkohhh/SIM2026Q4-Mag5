# getuserprofile_control.py - Control to get a user profile

from entity.userprofile import UserProfile

def get_userprofile(db, profile_id):
    userprofile = db.query(UserProfile).filter(
        UserProfile.profile_id == profile_id
    ).first()

    return userprofile