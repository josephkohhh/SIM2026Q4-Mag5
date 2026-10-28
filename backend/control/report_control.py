
# report_control.py - handles generating platform management reports

from entity.report import ReportEntity
from datetime import date


class ReportControl:

    # Initialise the entity object
    def __init__(self):
        self.report_entity = ReportEntity()

    # Call the Entity method to generate a daily report
    def generate_daily_report(self, report_date: date):
        return self.report_entity.daily_report(report_date)

    # Call the Entity method to generate a weekly report
    def generate_weekly_report(self, report_date: date):
        return self.report_entity.weekly_report(report_date)

    # Call the Entity method to generate a monthly report
    def generate_monthly_report(self, year: int, month: int):
        return self.report_entity.monthly_report(year, month)
