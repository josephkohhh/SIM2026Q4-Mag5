# create_companyprofile_control.py - handles creating a company profile

from entity.companyprofile import CompanyProfileEntity


class CreateCompanyProfileControl:

    # Initialise the entity object
    def __init__(self):
        self.companyprofile_entity = CompanyProfileEntity()

    # Call the Entity method
    def create_companyprofile(self, company_data: dict):
        return self.companyprofile_entity.create(company_data)
