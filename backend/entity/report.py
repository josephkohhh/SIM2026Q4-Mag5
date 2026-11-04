# report.py - generates platform user activity reports

from datetime import date, timedelta
from sqlalchemy import func, cast, Date, text
from sqlalchemy.exc import SQLAlchemyError

from database.database import session
from entity.useraccount import UserAccount
from entity.projectview import ProjectView
from entity.favorite import Favorite

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
                # Total project views within selected period
                total_views = (
                    db.query(func.count(ProjectView.view_id))
                    .filter(
                        ProjectView.created_at >= start_date,
                        ProjectView.created_at < end_date
                    )
                    .scalar()
                )

                # Total shortlists within selected period
                total_shortlists = (
                    db.query(func.count(Favorite.favourite_id))
                    .filter(
                        Favorite.created_at >= start_date,
                        Favorite.created_at < end_date
                    )
                    .scalar()
                )
                # Count total IDPs from PostgreSQL
                total_idps = db.execute(
                    text("SELECT COUNT(*) FROM project")
                ).scalar()
                # Count new IDPs created within the selected period
                new_idps = db.execute(
                    text("""
                        SELECT COUNT(*)
                        FROM project
                        WHERE created_at >= :start_date
                        AND created_at < :end_date
                    """),
                    {
                        "start_date": start_date,
                        "end_date": end_date
                    }
                ).scalar()
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
                    "new_idps": new_idps,
                    "total_idps": total_idps,
                    "total_views": total_views,
                    "total_shortlists": total_shortlists,
                    "activity": self.get_activity_over_time(start_date, end_date),
                    "by_category": self.get_by_category(start_date, end_date),
                    "most_viewed_idps": self.get_most_viewed_idps(start_date, end_date),
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
    # Get activity over time
    def get_activity_over_time(self, start_date: date, end_date: date):

        with session() as db:
            view_date = cast(ProjectView.created_at, Date)
            favorite_date = cast(Favorite.created_at, Date)

            views = (
                db.query(
                    view_date,
                    func.count(ProjectView.view_id)
                )
                .filter(
                    ProjectView.created_at >= start_date,
                    ProjectView.created_at < end_date
                )
                .group_by(view_date)
                .all()
            )

            shortlists = (
                db.query(
                    favorite_date,
                    func.count(Favorite.favourite_id)
                )
                .filter(
                    Favorite.created_at >= start_date,
                    Favorite.created_at < end_date
                )
                .group_by(favorite_date)
                .all()
            )

            activity = {}

            for day, count in views:
                key = day.isoformat()
                activity[key] = {
                    "date": key,
                    "views": count,
                    "shortlists": 0
                }

            for day, count in shortlists:
                key = day.isoformat()

                if key not in activity:
                    activity[key] = {
                        "date": key,
                        "views": 0,
                        "shortlists": 0
                    }

                activity[key]["shortlists"] = count

            return [activity[key] for key in sorted(activity)]
            # Get report statistics grouped by category
    def get_by_category(self, start_date, end_date):

        with session() as db:
            result = db.execute(
                text("""
                    SELECT
                        p.category_code AS category,
                        COALESCE(SUM(v.views), 0) AS views,
                        COALESCE(SUM(f.saved), 0) AS saved
                    FROM project p

                    LEFT JOIN (
                        SELECT project_id, COUNT(*) AS views
                        FROM projectview
                        WHERE created_at >= :start_date
                          AND created_at < :end_date
                        GROUP BY project_id
                    ) v ON p.project_id = v.project_id

                    LEFT JOIN (
                        SELECT project_id, COUNT(*) AS saved
                        FROM favorite
                        WHERE created_at >= :start_date
                          AND created_at < :end_date
                        GROUP BY project_id
                    ) f ON p.project_id = f.project_id

                    GROUP BY p.category_code
                    ORDER BY views DESC
                """),
                {
                    "start_date": start_date,
                    "end_date": end_date
                }
            ).mappings().all()

            return [
                {
                    "category": row["category"],
                    "views": row["views"],
                    "saved": row["saved"],
                    "shortlists": row["saved"]
                }
                for row in result
            ]
            # Get most viewed IDPs
    def get_most_viewed_idps(self, start_date, end_date):

        with session() as db:
            result = db.execute(
                text("""
                    SELECT
                        p.project_id,
                        p.project_name,
                        COALESCE(c.company_name, 'Unknown') AS designer,
                        COALESCE(v.views, 0) AS views,
                        COALESCE(f.shortlists, 0) AS shortlists
                    FROM project p

                    LEFT JOIN companyprofile c
                        ON p.companyprofile_id = c.companyprofile_id

                    LEFT JOIN (
                        SELECT project_id, COUNT(*) AS views
                        FROM projectview
                        WHERE created_at >= :start_date
                          AND created_at < :end_date
                        GROUP BY project_id
                    ) v ON p.project_id = v.project_id

                    LEFT JOIN (
                        SELECT project_id, COUNT(*) AS shortlists
                        FROM favorite
                        WHERE created_at >= :start_date
                          AND created_at < :end_date
                        GROUP BY project_id
                    ) f ON p.project_id = f.project_id

                    WHERE COALESCE(v.views, 0) > 0

                    ORDER BY views DESC, shortlists DESC
                    LIMIT 10
                """),
                {
                    "start_date": start_date,
                    "end_date": end_date
                }
            ).mappings().all()

            return [
                {
                    "project_id": row["project_id"],
                    "project_name": row["project_name"],
                    "designer": row["designer"],
                    "views": row["views"],
                    "shortlists": row["shortlists"]
                }
                for row in result
            ]