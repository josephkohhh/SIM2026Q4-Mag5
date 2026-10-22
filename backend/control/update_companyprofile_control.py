# update_companyprofile_control.py - handles companyprofile updates

from entity.companyprofile import CompanyProfileEntity


class UpdateCompanyProfileControl:

    # Initializes the entity object
    def __init__(self):
        self.companyprofile_entity = CompanyProfileEntity()

    # Call the Entity method
    def update_companyprofile(self, user_id: int, update_data: dict):
        return self.companyprofile_entity.update(user_id, update_data)


    