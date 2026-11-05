import unittest
from datetime import date

from entity.report import ReportEntity


class TestReportEntity(unittest.TestCase):

    def setUp(self):
        self.report = ReportEntity()

    # TEST 1: Generate a report for a date range
    def test_generate_report(self):

        result = self.report.generate_report(
            date(2026, 10, 1),
            date(2026, 11, 1)
        )

        self.assertIn("period", result)
        self.assertIn("total_new_registrations", result)
        self.assertIn("registrations_by_role", result)
        self.assertIn("active_accounts", result)
        self.assertIn("inactive_accounts", result)
        self.assertIn("previous_period_registrations", result)
        self.assertIn("registration_change", result)
        self.assertIn("registration_change_percentage", result)

    # TEST 2: Generate a daily report
    def test_daily_report(self):

        result = self.report.daily_report(
            date(2026, 11, 5)
        )

        self.assertEqual(
            result["period"]["start_date"],
            "2026-11-05"
        )

        self.assertEqual(
            result["period"]["end_date"],
            "2026-11-05"
        )

    # TEST 3: Generate a weekly report
    def test_weekly_report(self):

        result = self.report.weekly_report(
            date(2026, 11, 5)
        )

        self.assertEqual(
            result["period"]["start_date"],
            "2026-11-02"
        )

        self.assertEqual(
            result["period"]["end_date"],
            "2026-11-08"
        )

    # TEST 4: Generate a monthly report
    def test_monthly_report(self):

        result = self.report.monthly_report(2026, 11)

        self.assertEqual(
            result["period"]["start_date"],
            "2026-11-01"
        )

        self.assertEqual(
            result["period"]["end_date"],
            "2026-11-30"
        )


if __name__ == "__main__":
    unittest.main()