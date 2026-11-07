import { NavLink } from "react-router-dom";
import logo from "./Image/logo.png";
import "./designerportal.css";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function DesignerPortal({ logout }) {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadDashboard() {
            try {
                const response = await fetch(`${API}/get_all_project`, {
                    signal: controller.signal,
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const allProjects = await response.json();

                // Get logged-in designer ID
                const userId = Number(localStorage.getItem("currentUserId"));

                if (!userId) {
                    throw new Error("Designer user ID not found.");
                }

                // Get only this designer's projects
                const myProjects = allProjects.filter(
                    (project) => Number(project.user_id) === userId
                );

                // Count current IDPs
                const currentIDPs = myProjects.filter(
                    (project) => project.status === "ONGOING"
                ).length;

                // Count past IDPs
                const pastIDPs = myProjects.filter(
                    (project) =>
                        ["COMPLETED", "PAST"].includes(project.status)
                ).length;

                // Get views and shortlists for each IDP
                const projectsWithStats = await Promise.all(
                    myProjects.map(async (project) => {
                        const [viewResponse, shortlistResponse] =
                            await Promise.all([
                                fetch(
                                    `${API}/get_projectview/${project.project_id}`,
                                    {
                                        signal: controller.signal,
                                        credentials: "include"
                                    }
                                ),
                                fetch(
                                    `${API}/get_shortlistcount/${project.project_id}`,
                                    {
                                        signal: controller.signal,
                                        credentials: "include"
                                    }
                                )
                            ]);

                        if (!viewResponse.ok || !shortlistResponse.ok) {
                            throw new Error("Failed to load project statistics");
                        }

                        const viewData = await viewResponse.json();
                        const shortlistData = await shortlistResponse.json();

                        const shortlistCount =
                            shortlistData.shortlist_count ??
                            shortlistData.shortlistcount ??
                            shortlistData.count;

                        if (shortlistCount == null) {
                            throw new Error("Unexpected shortlist API response");
                        }

                        return {
                            id: project.project_id,
                            title: project.project_name,
                            views: Number(viewData.view_count ?? 0),
                            shortlists: Number(shortlistCount),

                            daily_views: Array.isArray(viewData.daily_views)
                                ? viewData.daily_views
                                : [],

                            daily_shortlists: Array.isArray(
                                shortlistData.daily_shortlists
                            )
                                ? shortlistData.daily_shortlists
                                : []
                        };
                    })
                );

                // Total views
                const totalViews = projectsWithStats.reduce(
                    (total, project) => total + project.views,
                    0
                );

                // Total shortlists
                const totalShortlists = projectsWithStats.reduce(
                    (total, project) => total + project.shortlists,
                    0
                );

                // Get top 3 most viewed IDPs
                const topIDPs = [...projectsWithStats]
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 3);

                // Combine daily views and shortlists
                const activityMap = new Map();

                projectsWithStats.forEach(project => {

                    // Add daily views
                    project.daily_views.forEach(day => {
                        const date = day.date;

                        if (!activityMap.has(date)) {
                            activityMap.set(date, {
                                date: date,
                                views: 0,
                                shortlists: 0
                            });
                        }

                        activityMap.get(date).views +=
                            Number(day.views) || 0;
                    });

                    // Add daily shortlists
                    project.daily_shortlists.forEach(day => {
                        const date = day.date;

                        if (!activityMap.has(date)) {
                            activityMap.set(date, {
                                date: date,
                                views: 0,
                                shortlists: 0
                            });
                        }

                        activityMap.get(date).shortlists +=
                            Number(day.shortlists) || 0;
                    });
                });

                // Sort activity by date
                const activity = Array.from(activityMap.values())
                    .sort((a, b) => a.date.localeCompare(b.date));

                // Update dashboard
                if (!controller.signal.aborted) {
                    setDashboard({
                        total_views: totalViews,
                        times_shortlisted: totalShortlists,
                        current_idps: currentIDPs,
                        past_idps: pastIDPs,
                        top_idps: topIDPs,
                        activity: activity
                    });

                    setError("");
                }

            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err.message);
                }

            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => controller.abort();
    }, []);

    const activity = Array.isArray(dashboard?.activity)
        ? dashboard.activity
        : [];

    const topIDPs = Array.isArray(dashboard?.top_idps)
        ? dashboard.top_idps
        : [];

    const maxActivity = Math.max(
        1,
        ...activity.map(day =>
            Math.max(
                Number(day.views) || 0,
                Number(day.shortlists) || 0
            )
        )
    );

    return (
        <div className="DesignerPortal_page">

            {/* Sidebar */}
            <aside className="CompanyProfile_sidebar">

                <img
                    className="CompanyProfile_brand"
                    src={logo}
                    alt="Logo"
                />

                <nav
                    className="CompanyProfile_menu"
                    aria-label="Designer navigation"
                >
                    <NavLink to="/designer_portal" end>
                        Dashboard
                    </NavLink>

                    <NavLink to="/designer_portal/company_profile">
                        Company profile
                    </NavLink>

                    <NavLink to="/designer_portal/my_idps">
                        My IDPs
                    </NavLink>

                    <NavLink to="/designer_portal/my_profile">
                        My profile
                    </NavLink>
                </nav>

                <button
                    className="CompanyProfile_signout"
                    type="button"
                    onClick={logout}
                >
                    Sign out
                </button>
            </aside>

            {/* Dashboard content */}
            <div className="CompanyProfile_page">
                <div className="CompanyProfile_content">

                    <header className="CompanyProfile_header">
                        <h1>Designer Dashboard</h1>
                    </header>

                    {/* Performance overview */}
                    <div className="DD_overview">
                        <span>Performance overview</span>
                    </div>

                    {error && (
                        <p className="DD_error" role="alert">
                            {error}
                        </p>
                    )}

                    {/* Statistics */}
                    <section className="DD_stats">

                        <div className="DD_card DD_stat">
                            <span>Total views</span>
                            <strong>
                                {dashboard?.total_views ?? "—"}
                            </strong>
                        </div>

                        <div className="DD_card DD_stat">
                            <span>Times shortlisted</span>
                            <strong>
                                {dashboard?.times_shortlisted ?? "—"}
                            </strong>
                        </div>

                        <div className="DD_card DD_stat">
                            <span>Current IDPs</span>
                            <strong>
                                {dashboard?.current_idps ?? "—"}
                            </strong>
                        </div>

                        <div className="DD_card DD_stat">
                            <span>Past IDPs</span>
                            <strong>
                                {dashboard?.past_idps ?? "—"}
                            </strong>
                        </div>

                    </section>

                    {/* Chart and Top IDPs */}
                    <section className="DD_middle">

                        {/* Views and shortlists chart */}
                        <div className="DD_card DD_chartCard">
                            <h2>Views and shortlists over time</h2>

                            <div className="DD_chart">
                                {activity.length > 0 ? (
                                    <div className="DD_chartColumns">

                                        {activity.map(day => (
                                            <div
                                                className="DD_day"
                                                key={day.date}
                                            >
                                                <div className="DD_bars">

                                                    <div
                                                        className="DD_bar DD_views"
                                                        title={`${day.date}: ${day.views} views`}
                                                        style={{
                                                            height: `${
                                                                (Number(day.views) || 0) /
                                                                maxActivity * 100
                                                            }%`
                                                        }}
                                                    />

                                                    <div
                                                        className="DD_bar DD_shortlists"
                                                        title={`${day.date}: ${day.shortlists} shortlists`}
                                                        style={{
                                                            height: `${
                                                                (Number(day.shortlists) || 0) /
                                                                maxActivity * 100
                                                            }%`
                                                        }}
                                                    />

                                                </div>

                                                <small>
                                                    {String(day.date).slice(5)}
                                                </small>
                                            </div>
                                        ))}

                                    </div>
                                ) : (
                                    <span>
                                        {loading
                                            ? "Loading activity..."
                                            : "No activity to display"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Top IDPs */}
                        <div className="DD_card DD_topCard">
                            <h2>Top IDPs</h2>

                            {topIDPs.length > 0 ? (
                                <ol>
                                    {topIDPs.slice(0, 3).map(item => (
                                        <li key={item.id}>
                                            {item.title} — {item.views} views
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p>
                                    {loading
                                        ? "Loading..."
                                        : "No projects yet"}
                                </p>
                            )}
                        </div>

                    </section>

                </div>
            </div>

        </div>
    );
}

export default DesignerPortal;