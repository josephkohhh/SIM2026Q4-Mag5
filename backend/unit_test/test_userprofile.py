import unittest

from entity.userprofile import UserProfileEntity


class TestUserProfileEntity(unittest.TestCase):

    def setUp(self):
        self.user_profile = UserProfileEntity()

        self.profile_data = {
            "role": "TEST_ROLE",
            "description": "Role for unit testing."
        }

    # READ: Retrieve all user profiles
    def test_get_all(self):

        result = self.user_profile.get_all()

        self.assertIsInstance(result, list)

    # READ: Retrieve a user profile by ID
    def test_get_by_id(self):

        result = self.user_profile.get_by_role("TEST_ROLE")

        profile_id = result.profile_id

        result = self.user_profile.get_by_id(profile_id)

        self.assertEqual(
            result.profile_id,
            profile_id
        )

    # READ: Retrieve a user profile by role
    def test_get_by_role(self):

        result = self.user_profile.get_by_role("TEST_ROLE")

        self.assertEqual(
            result.role,
            "TEST_ROLE"
        )

    # CREATE: Create a new user profile
    def test_create(self):

        result = self.user_profile.create(self.profile_data)

        self.assertEqual(
            result["message"],
            "User profile TEST_ROLE has been created successfully."
        )

    # UPDATE: Update an existing user profile
    def test_update(self):

        updates = {
            "description": "Updated test role description."
        }

        result = self.user_profile.update(
            "TEST_ROLE",
            updates
        )

        self.assertEqual(
            result["message"],
            "User profile TEST_ROLE has been updated successfully."
        )

    # DELETE: Delete an existing user profile
    def test_delete(self):

        result = self.user_profile.delete("TEST_ROLE")

        self.assertEqual(
            result["message"],
            "User profile deleted successfully."
        )


if __name__ == "__main__":
    unittest.main()