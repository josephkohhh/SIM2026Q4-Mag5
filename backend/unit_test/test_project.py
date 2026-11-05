import unittest

from entity.project import ProjectEntity


class TestProjectEntity(unittest.TestCase):

    def setUp(self):
        self.project = ProjectEntity()

        self.project_data = {
            "user_id": 1,
            "companyprofile_id": 1,
            "project_name": "Test Project",
            "description": "A project for unit testing.",
            "category_code": "RESIDENTIAL",
            "project_image": None
        }

    # CREATE: Create a new project
    def test_create(self):

        result = self.project.create(self.project_data)

        self.assertEqual(
            result["message"],
            "Project Test Project created successfully."
        )

    # READ: Retrieve all projects
    def test_get_all(self):

        result = self.project.get_all()

        self.assertIsInstance(result, list)

    # READ: Retrieve a project by name
    def test_get_by_name(self):

        result = self.project.get_by_name(
            "Test Project",
            user_id=1
        )

        self.assertEqual(
            result["project_name"],
            "Test Project"
        )

    # UPDATE: Update an existing project
    def test_update(self):

        updates = {
            "description": "Updated project description."
        }

        result = self.project.update(
            "Test Project",
            updates
        )

        self.assertIn(
            "updated successfully",
            result["message"]
        )

    # DELETE: Delete an existing project
    def test_delete(self):

        result = self.project.delete("Test Project")

        self.assertEqual(
            result["message"],
            "Project Test Project deleted successfully."
        )


if __name__ == "__main__":
    unittest.main()