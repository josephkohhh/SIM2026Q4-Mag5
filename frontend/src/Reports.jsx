import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "./Image/logo.png";
import "./PlatformManagementportal.css";
import "./Reports.css";

// Change this to your deployed FastAPI URL when you publish the website.
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function datesFor(period) {
  const today = new Date();
  const start = new Date(today);

  if (period === "weekly") {
    // Current week, starting Monday.
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  } else if (period === "monthly") {
    // Current calendar month.
    start.setDate(1);
  }

  return { from: formatDate(start), to: formatDate(today) };
}

function readableDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function csvCell(value) {
  // Prevent spreadsheet formulas when exporting text from the database.
  let text = String(value ?? "");
  if (/^[=+@-]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}

export default function Reports({ logout }) {
  const [period, setPeriod] = useState("daily");
  const [from, setFrom] = useState(() => datesFor("daily").from);
  const [to, setTo] = useState(() => datesFor("daily").to);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function selectPeriod(nextPeriod) {
    const range = datesFor(nextPeriod);
    setPeriod(nextPeriod);
    setFrom(range.from);
    setTo(range.to);
  }

  useEffect(() => {
    if (!from || !to || from > to) {
      setLoading(false);
      setReport(null);
      setError("Please select a valid date range.");
      return;
    }

    const controller = new AbortController();

    async function loadReport() {
      setLoading(true);
      setError("");
      setReport(null);

      try {
      let url;

        if (period === "daily") {
          url = `${API}/reports/daily?report_date=${to}`;
        } else if (period === "weekly") {
          url = `${API}/reports/weekly?report_date=${to}`;
        } else if (period === "monthly") {
          const [year, month] = from.split("-");
          url = `${API}/reports/monthly?year=${year}&month=${Number(month)}`;
        } else {
          throw new Error("Custom date ranges are not supported by the backend.");
        }

        const response = await fetch(url, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Report request failed (${response.status})`);

        const result = await response.json();
        if (!controller.signal.aborted) setReport(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Could not load report from FastAPI. Check your API and database.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadReport();
    return () => controller.abort();
  }, [from, to, period]);

  const activity = Array.isArray(report?.activity) ? report.activity : [];
  const categories = Array.isArray(report?.by_category) ? report.by_category : [];
  const mostViewed = Array.isArray(report?.most_viewed_idps)
    ? report.most_viewed_idps
    : [];
  const highestActivity = Math.max(
    1,
    ...activity.map((day) => Math.max(Number(day.views) || 0, Number(day.shortlists) || 0))
  );

  function exportReport() {
    if (!report) return;

    const rows = [
      ["Report start", from],
      ["Report end", to],
      [],
      ["Statistic", "Count"],
      ["New IDPs", report.new_idps],
      ["Total views", report.total_views],
      ["Total shortlists", report.total_shortlists],
      [],
      ["Date", "Views", "Shortlists"],
      ...activity.map((day) => [day.date, day.views, day.shortlists]),
      [],
      ["Category", "Views", "Saved"],
      ...categories.map((item) => [item.category, item.views, item.shortlists]),
      [],
      ["IDP", "Designer", "Views", "Shortlists"],
      ...mostViewed.map((item) => [
        item.project_name,
        item.designer,
        item.views,
        item.shortlists,
      ]),
    ];

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const file = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reports_${from}_${to}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="PM_page reports-page">
      {/* Reuse the exact sidebar classes from PlatformManagementportal.jsx */}
      <aside className="PM_navbar">
        <img src={logo} alt="FindMyID logo" />
        <nav className="PM_menu">
          <Link to="/management_portal">Categories</Link>
          <Link to="/management_portal/report" className="active">Report</Link>
        </nav>
        <button type="button" className="signout" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="PM_content reports-content">
        <header className="reports-header">
          <h1>9 · Reports</h1>
        </header>

        <div className="reports-filterbar">
          {["daily", "weekly", "monthly"].map((tab) => (
            <button
              type="button"
              key={tab}
              className={`reports-period ${period === tab ? "selected" : ""}`}
              onClick={() => selectPeriod(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}

          <div className="reports-date-range">
            <span>Date range:</span>
            <input
              type="date"
              aria-label="From date"
              value={from}
              max={to || undefined}
              onChange={(event) => {
                setPeriod("custom");
                setFrom(event.target.value);
              }}
            />
            <span className="reports-date-dash">–</span>
            <input
              type="date"
              aria-label="To date"
              value={to}
              min={from || undefined}
              onChange={(event) => {
                setPeriod("custom");
                setTo(event.target.value);
              }}
            />
          </div>

          <button
            className="reports-export"
            type="button"
            disabled={!report || loading}
            onClick={exportReport}
          >
            Export
          </button>
        </div>

        <p className="reports-period-caption">
          {period === "custom" ? "Custom report" : `${period.charAt(0).toUpperCase()}${period.slice(1)} report`}
          {` · ${readableDate(from)} to ${readableDate(to)}`}
        </p>
        {loading && <p className="reports-message">Loading report...</p>}
        {error && <p className="reports-error" role="alert">{error}</p>}

        <section className="reports-stats" aria-label="Summary statistics">
          <div className="reports-card reports-stat">
            <span>New IDPs</span>
            <strong>{report?.new_idps ?? "—"}</strong>
          </div>
          <div className="reports-card reports-stat">
            <span>Total views</span>
            <strong>{report?.total_views ?? "—"}</strong>
          </div>
          <div className="reports-card reports-stat">
            <span>Total shortlists</span>
            <strong>{report?.total_shortlists ?? "—"}</strong>
          </div>
        </section>

        <section className="reports-middle">
          <div className="reports-card reports-activity-card">
            <h2>Activity over time</h2>
            <div className="reports-chart">
              {activity.length > 0 ? (
                <div className="reports-chart-columns">
                  {activity.map((day) => (
                    <div className="reports-chart-day" key={day.date}>
                      <div className="reports-bars">
                        <div
                          className="reports-bar views"
                          title={`${day.date}: ${day.views} views`}
                          style={{ height: `${(Number(day.views) || 0) / highestActivity * 100}%` }}
                        />
                        <div
                          className="reports-bar shortlists"
                          title={`${day.date}: ${day.shortlists} shortlists`}
                          style={{ height: `${(Number(day.shortlists) || 0) / highestActivity * 100}%` }}
                        />
                      </div>
                      <small>{String(day.date).slice(5)}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="reports-empty-chart">
                  {loading ? "Loading chart..." : "No activity for this date range"}
                </span>
              )}
            </div>
            <div className="reports-chart-legend">
              <span><i className="reports-legend-views" /> Views</span>
              <span><i className="reports-legend-saved" /> Shortlists</span>
            </div>
          </div>

          <div className="reports-card reports-category-card">
            <h2>By category</h2>
            <div className="reports-table-scroll">
              <table>
                <thead>
                  <tr><th>Category</th><th>Views</th><th>Saved</th></tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? categories.map((item, index) => (
                    <tr key={`${item.category}-${index}`}>
                      <td>{item.category}</td>
                      <td>{item.views}</td>
                      <td>{item.shortlists}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3">{loading ? "Loading..." : "No data"}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="reports-card reports-most-viewed">
          <h2>Most viewed IDPs</h2>
          <div className="reports-table-scroll">
            <table>
              <thead>
                <tr><th>IDP</th><th>Designer</th><th>Views</th><th>Shortlists</th></tr>
              </thead>
              <tbody>
              {mostViewed.length > 0 ? mostViewed.map((item, index) => (
                <tr key={`${item.project_id}-${index}`}>
                  <td>{item.project_name}</td>
                  <td>{item.designer}</td>
                  <td>{item.views}</td>
                  <td>{item.shortlists}</td>
                </tr>
                )) : (
                  <tr><td colSpan="4">{loading ? "Loading..." : "No projects found"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
