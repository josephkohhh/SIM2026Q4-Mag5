# get_companyprofile_control.py - handles retrieving a companyprofile by user_id

from entity.companyprofile import CompanyProfileEntity


class GetCompanyProfileControl:

    # Initialise the entity object
    def __init__(self):
        self.companyprofile_entity = CompanyProfileEntity()

    # Call the Entity method
    def get_companyprofile(self, user_id: int):
        company_profile = self.companyprofile_entity.get_by_id(user_id)

        # If None return None
        if company_profile is None:
            return {"company_profile": None}

        # Return specific fields only  
        return {
            "company_profile":{
            "companyprofile_id" : company_profile.companyprofile_id, 
            "company_name": company_profile.company_name,  
            "description": company_profile.description,
            "phone_no": company_profile.phone_no,
            "address": company_profile.address,
            "status" : company_profile.status
          }
        }
