import unittest

from entity.companyprofile import CompanyProfileEntity


class TestCompanyProfileEntity(unittest.TestCase):

    def setUp(self):
        self.company_profile = CompanyProfileEntity()

        self.user_id = 1

        self.company_data = {
            "user_id": self.user_id,
            "company_name": "Test Company",
            "description": "Company for unit testing.",
            "phone_no": "91234567",
            "address": "Singapore"
        }

    # CREATE: Create a company profile
    def test_create(self):

        result = self.company_profile.create(
            self.company_data
        )

        self.assertEqual(
            result["message"],
            "Company profile created successfully."
        )

    # READ: Retrieve company profile by user ID
    def test_get_by_id(self):

        result = self.company_profile.get_by_id(
            self.user_id
        )

        self.assertEqual(
            result.user_id,
            self.user_id
        )

    # UPDATE: Update company profile details
    def test_update(self):

        updates = {
            "company_name": "Updated Test Company",
            "description": "Updated company description."
        }

        result = self.company_profile.update(
            self.user_id,
            updates
        )

        self.assertEqual(
            result["message"],
            "Company profile updated successfully."
        )

    # SUSPEND: Set company profile status to INACTIVE
    def test_suspend(self):

        result = self.company_profile.suspend(
            self.user_id
        )

        self.assertEqual(
            result["message"],
            "Company profile hidden successfully."
        )


if __name__ == "__main__":
    unittest.main()