# get_companyprofile_control.py - handles retrieving a companyprofile by user_id

from entity.companyprofile import CompanyProfileEntity


class GetCompanyProfileControl:

    # Initialise the entity object
    def __init__(self):
        self.companyprofile_entity = CompanyProfileEntity()

    # Call the Entity method
    def get_companyprofile(self, category_code: str):
        company_profile = self.companyprofile_entity.get_by_id(category_code)

        # Return specific fields ooly  
        return {
          "company_name": company_profile.company_name,  
          "description": company_profile.description,
          "phone_no": company_profile.phone_no,
          "address": company_profile.address,
        }
