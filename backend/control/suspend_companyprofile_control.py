# suspend_companyprofile_control.py - handles company profile suspension

from entity.companyprofile import CompanyProfileEntity

class SuspendCompanyProfileControl:

    # Initialise the entity object
    def __init__(self):
        self.companyprofile_entity = CompanyProfileEntity()

    # Call the Entity method
    def suspend_companyprofile(self, user_id: int):
        return self.companyprofile_entity.suspend(user_id)