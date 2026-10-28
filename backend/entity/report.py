# report.py - generates platform user activity reports

from datetime import date, timedelta
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from database.database import session
from entity.useraccount import UserAccount


class ReportEntity:

    # Generate a user activity report for a date range
    def generate_report(self, start_date: date, end_date: date):

        # Compare with the previous period of equal length
        period_days = (end_date - start_date).days
        previous_start = start_date - timedelta(days=period_days)
        previous_end = start_date

        with session() as db:
            try:
                # Total new registrations in the selected period
                new_registrations = (
                    db.query(func.count(UserAccount.user_id))
                    .filter(
                        UserAccount.created_at >= start_date,
                        UserAccount.created_at < end_date
                    )
                    .scalar()
                )

                # Registrations grouped by role
                registrations_by_role = (
                    db.query(
                        UserAccount.role,
                        func.count(UserAccount.user_id)
                    )
                    .filter(
                        UserAccount.created_at >= start_date,
                        UserAccount.created_at < end_date
                    )
                    .group_by(UserAccount.role)
                    .all()
                )

                # Current total active accounts
                active_accounts = (
                    db.query(func.count(UserAccount.user_id))
                    .filter(UserAccount.status == "ACTIVE")
                    .scalar()
                )

                # Current total inactive accounts
                inactive_accounts = (
                    db.query(func.count(UserAccount.user_id))
                    .filter(UserAccount.status == "INACTIVE")
                    .scalar()
                )

                # Registrations in the previous equivalent period
                previous_registrations = (
                    db.query(func.count(UserAccount.user_id))
                    .filter(
                        UserAccount.created_at >= previous_start,
                        UserAccount.created_at < previous_end
                    )
                    .scalar()
                )

                # Calculate registration change
                change = new_registrations - previous_registrations

                if previous_registrations > 0:
                    change_percentage = round(
                        change / previous_registrations * 100, 2
                    )
                else:
                    change_percentage = None

                return {
                    "period": {
                        "start_date": start_date.isoformat(),
                        "end_date": (
                            end_date - timedelta(days=1)
                        ).isoformat()
                    },
                    "total_new_registrations": new_registrations,
                    "registrations_by_role": {
                        str(role): count
                        for role, count in registrations_by_role
                    },
                    "active_accounts": active_accounts,
                    "inactive_accounts": inactive_accounts,
                    "previous_period_registrations": previous_registrations,
                    "registration_change": change,
                    "registration_change_percentage": change_percentage
                }

            except SQLAlchemyError:
                db.rollback()
                raise

    # Generate a daily report
    def daily_report(self, report_date: date):

        start_date = report_date
        end_date = start_date + timedelta(days=1)

        return self.generate_report(start_date, end_date)

    # Generate a weekly report (Monday to Sunday)
    def weekly_report(self, report_date: date):

        start_date = report_date - timedelta(
            days=report_date.weekday()
        )
        end_date = start_date + timedelta(days=7)

        return self.generate_report(start_date, end_date)

    # Generate a monthly report
    def monthly_report(self, year: int, month: int):

        start_date = date(year, month, 1)

        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

        return self.generate_report(start_date, end_date)
