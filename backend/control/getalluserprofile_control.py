# getalluserprofile_control.py - Control to get all user profiles

from entity.userprofile import UserProfile


def get_all_userprofiles(db):

    userprofiles = db.query(UserProfile).all()

    return userprofiles
