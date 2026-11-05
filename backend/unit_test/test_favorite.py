import unittest

from entity.favorite import FavoriteEntity


class TestFavorite(unittest.TestCase):

    def setUp(self):
        self.favorite = FavoriteEntity()

        # Use existing test customer and project IDs
        self.user_id = 1
        self.project_id = 101

    # CREATE: Save a project to favorites
    def test_save(self):

        result = self.favorite.save(
            self.user_id,
            self.project_id
        )

        self.assertEqual(
            result["message"],
            "Project added to favorites successfully."
        )

    # READ: Retrieve all customer favorites
    def test_get_all(self):

        result = self.favorite.get_all(self.user_id)

        self.assertIsNotNone(result)

    # READ: Retrieve project favorite count
    def test_get_count(self):

        result = self.favorite.get_count(self.project_id)

        self.assertIn("shortlist_count", result)

    # DELETE: Remove a favorite
    def test_delete(self):

        # First save a favorite
        self.favorite.save(
            self.user_id,
            self.project_id
        )

        # Retrieve its ID
        favorites = self.favorite.get_all(self.user_id)
        favourite_id = favorites[0].favourite_id

        # Delete the favorite
        result = self.favorite.delete(favourite_id)

        self.assertEqual(
            result["message"],
            "Removed successfully."
        )


if __name__ == "__main__":
    unittest.main()