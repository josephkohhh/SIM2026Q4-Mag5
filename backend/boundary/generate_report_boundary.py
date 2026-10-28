# generate_report_boundary.py - boundary for platform mgt to generate reports

from fastapi import APIRouter, HTTPException, Query
from datetime import date
from control.report_control import ReportControl

router = APIRouter()

# Initialise the controller object
report_control = ReportControl()

# Generate daily report endpoint
@router.get("/reports/daily")
def generate_daily_report(report_date: date = Query(default=None)):
    try:
        if report_date is None:
            report_date = date.today()

        # Call the controller method
        return report_control.generate_daily_report(report_date)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Generate weekly report endpoint
@router.get("/reports/weekly")
def generate_weekly_report(report_date: date = Query(default=None)):
    try:
        if report_date is None:
            report_date = date.today()

        # Call the controller method
        return report_control.generate_weekly_report(report_date)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Generate monthly report endpoint
@router.get("/reports/monthly")
def generate_monthly_report(
    year: int = Query(default=None, ge=2000, le=2100),
    month: int = Query(default=None, ge=1, le=12)
):
    try:
        today = date.today()

        if year is None:
            year = today.year

        if month is None:
            month = today.month

        # Call the controller method
        return report_control.generate_monthly_report(year, month)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))