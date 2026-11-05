import unittest

from entity.projectview import ProjectViewEntity


class TestProjectViewEntity(unittest.TestCase):

    def setUp(self):
        self.project_view = ProjectViewEntity()

        self.project_id = 101
        self.user_id = 1

    # TEST 1: Create a project view
    def test_create_view(self):

        result = self.project_view.create_view(
            self.project_id,
            self.user_id
        )

        # Verify that the view was created successfully
        self.assertIsNone(result)

    # TEST 2: Retrieve the total number of project views
    def test_get_view_count(self):

        result = self.project_view.get_view_count(
            self.project_id
        )

        self.assertIn("view_count", result)

        self.assertIsInstance(
            result["view_count"],
            int
        )


if __name__ == "__main__":
    unittest.main()