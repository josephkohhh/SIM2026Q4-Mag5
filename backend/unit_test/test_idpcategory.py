import unittest

from entity.idpcategory import IdpCategoryEntity


class TestIdpCategoryEntity(unittest.TestCase):

    def setUp(self):
        self.category = IdpCategoryEntity()

        self.category_data = {
            "category_code": "TEST_CATEGORY",
            "description": "Category for unit testing."
        }

    # READ: Retrieve all categories
    def test_get_all(self):

        result = self.category.get_all()

        self.assertIsInstance(result, list)

    # READ: Retrieve category by code
    def test_get_by_code(self):

        result = self.category.get_by_code("TEST_CATEGORY")

        self.assertEqual(
            result.category_code,
            "TEST_CATEGORY"
        )

    # READ: Retrieve category by category code
    def test_get_by_category_code(self):

        result = self.category.get_by_category_code(
            "TEST_CATEGORY"
        )

        self.assertEqual(
            result.category_code,
            "TEST_CATEGORY"
        )

    # CREATE: Create a new category
    def test_create(self):

        result = self.category.create(self.category_data)

        self.assertEqual(
            result["message"],
            "Category TEST_CATEGORY created successfully."
        )

    # UPDATE: Update an existing category
    def test_update(self):

        updates = {
            "description": "Updated test category description."
        }

        result = self.category.update(
            "TEST_CATEGORY",
            updates
        )

        self.assertEqual(
            result["message"],
            "Category TEST_CATEGORY updated successfully."
        )

    # DELETE: Delete an existing category
    def test_delete(self):

        result = self.category.delete("TEST_CATEGORY")

        self.assertEqual(
            result["message"],
            "Category TEST_CATEGORY deleted."
        )


if __name__ == "__main__":
    unittest.main()