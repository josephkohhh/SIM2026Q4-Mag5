import unittest

from entity.useraccount import UserAccountEntity


class TestUserAccountEntity(unittest.TestCase):

    def setUp(self):
        self.user_account = UserAccountEntity()

        self.user_data = {
            "email": "test@example.com",
            "password": "Password123!",
            "role": "CUSTOMER",
            "name": "Test",
            "surname": "User",
            "phone_no": "91234567"
        }

    # CREATE: Create a new user account
    def test_create(self):

        result = self.user_account.create(self.user_data)

        self.assertEqual(
            result["message"],
            "User account test@example.com has been created successfully."
        )

    # READ: Retrieve user account by email
    def test_get_by_email(self):

        result = self.user_account.get_by_email(
            "test@example.com"
        )

        self.assertEqual(
            result.email,
            "test@example.com"
        )

    # LOGIN: Authenticate user account
    def test_login(self):

        login_data = {
            "email": "test@example.com",
            "password": "Password123!"
        }

        result = self.user_account.login(login_data)

        self.assertEqual(
            result["message"],
            "Welcome Test!"
        )

        self.assertIn("access_token", result)

    # UPDATE: Update user account details
    def test_update(self):

        updates = {
            "name": "Updated"
        }

        result = self.user_account.update(
            "test@example.com",
            updates
        )

        self.assertEqual(
            result["message"],
            "User account test@example.com has been updated successfully."
        )

    # SUSPEND: Set account status to INACTIVE
    def test_suspend(self):

        result = self.user_account.suspend(
            "test@example.com"
        )

        self.assertEqual(
            result["message"],
            "User account test@example.com has been suspended."
        )


if __name__ == "__main__":
    unittest.main()