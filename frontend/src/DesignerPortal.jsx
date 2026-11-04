
        import { NavLink, useLocation } from "react-router-dom";
        import logo from "./Image/logo.png";
        import "./designerportal.css";
        import { useEffect, useState } from "react";


        const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

        function DesignerPortal( {logout} ){
            const [dashboard, setDashboard] = useState(null);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState("");
            const [showNewIDP, setShowNewIDP] = useState(false);
            const [editingIDPId, setEditingIDPId] = useState(null);
            const [newIDP, setNewIDP] = useState({
            title: "",
            category: "",
            status: "Current",
            completion_date: "",
            description: ""
        });

        const [idpImages, setIdpImages] = useState([]);
        const [imagePreviews, setImagePreviews] = useState([]);
        const [formError, setFormError] = useState("");
        const [savingIDP, setSavingIDP] = useState(false);


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
            const [viewResponse, shortlistResponse] = await Promise.all([
                fetch(`${API}/get_projectview/${project.project_id}`, {
                    signal: controller.signal,
                    credentials: "include"
                }),
                fetch(`${API}/get_shortlistcount/${project.project_id}`, {
                    signal: controller.signal,
                    credentials: "include"
                })
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
    status: project.status,
    views: Number(viewData.view_count ?? 0),
    shortlists: Number(shortlistCount),

    daily_views: Array.isArray(viewData.daily_views)
        ? viewData.daily_views
        : [],

    daily_shortlists: Array.isArray(shortlistData.daily_shortlists)
        ? shortlistData.daily_shortlists
        : []
        };
        })
    );

            const totalViews = projectsWithStats.reduce(
                (total, project) => total + project.views, 0
            );

            const totalShortlists = projectsWithStats.reduce(
                
                (total, project) => total + project.shortlists, 0
            );
     // Get top 3 most viewed IDPs
            const topIDPs = [...projectsWithStats]
                .sort((a, b) => b.views - a.views)
                .slice(0, 3);
            // Combine daily views and shortlists from all designer projects
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

                    activityMap.get(date).views += Number(day.views) || 0;
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
                    activity: activity,
                    idps: projectsWithStats
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
                ? dashboard.activity : [];

            const topIDPs = Array.isArray(dashboard?.top_idps)
                ? dashboard.top_idps : [];

            const projects = Array.isArray(dashboard?.idps)
                ? dashboard.idps : [];

            const maxActivity = Math.max(
                1,
                ...activity.map(day =>
                    Math.max(Number(day.views) || 0, Number(day.shortlists) || 0)
                )
            );


           async function deleteIDP(project) {
                if (!window.confirm(`Delete "${project.title}"?`)) return;

                try {
                    const response = await fetch(
                        `${API}/delete_project/${encodeURIComponent(project.title)}`,
                        {
                            method: "DELETE",
                            credentials: "include"
                        }
                    );

                    if (!response.ok) {
                        const data = await response.json().catch(() => ({}));
                        throw new Error(data.detail || "Unable to delete IDP.");
                    }

                    window.location.reload();

                } catch (err) {
                    window.alert(err.message);
                }
            }
            async function openEditIDP(project) {
                try {
                    const userId = Number(localStorage.getItem("currentUserId"));

                    if (!userId) {
                        throw new Error("Designer user ID not found.");
                    }

                    const response = await fetch(
                        `${API}/get_project/${encodeURIComponent(project.title)}/${userId}`,
                        {
                            credentials: "include"
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Unable to load IDP information.");
                    }

                    const data = await response.json();

                    setNewIDP({
                        title: data.project_name || project.title,
                        category: data.category_code || "",
                        status: data.status === "ONGOING" ? "Current" : "Past",
                        completion_date: "",
                        description: data.description || ""
                    });

                    setEditingIDPId(project.id);
                    setIdpImages([]);
                    setImagePreviews([]);
                    setFormError("");
                    setShowNewIDP(true);

                } catch (err) {
                    window.alert(err.message);
                }
            }

                function closeNewIDP() {
                    setShowNewIDP(false);
                    setEditingIDPId(null);
                    setFormError("");
                    setIdpImages([]);
                    setImagePreviews([]);
                    setNewIDP({
                        title: "",
                        category: "",
                        status: "Current",
                        completion_date: "",
                        description: ""
                    });
                }

                async function handleIDPImages(event) {
                    const files = Array.from(event.target.files || []).slice(0, 4);
                    setIdpImages(files);

                    const previews = await Promise.all(
                        files.map(file => new Promise(resolve => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = () => resolve("");
                            reader.readAsDataURL(file);
                        }))
                    );

                    setImagePreviews(previews);
                }

async function saveNewIDP(event) {
    event.preventDefault();
    setSavingIDP(true);
    setFormError("");

    try {
        const userId = Number(localStorage.getItem("currentUserId"));

        if (!userId) {
            throw new Error("Designer user ID not found.");
        }

        // Retrieve the designer's existing company profile ID
        const projectResponse = await fetch(`${API}/get_all_project`, {
            credentials: "include"
        });

        if (!projectResponse.ok) {
            throw new Error("Unable to retrieve project information.");
        }

        const allProjects = await projectResponse.json();

        const existingProject = allProjects.find(
            (project) => Number(project.user_id) === userId
        );

        if (!existingProject) {
            throw new Error(
                "Cannot determine company profile ID. No existing designer project found."
            );
        }

        const formData = new FormData();

        formData.append("project_name", newIDP.title.trim());
        formData.append("description", newIDP.description.trim());
        formData.append("category_code", newIDP.category.trim());
        formData.append(
            "status",
            newIDP.status === "Current" ? "ONGOING" : "COMPLETED"
        );

        let url;
        let method;

        if (editingIDPId === null) {
            // CREATE IDP
            url = `${API}/create_project`;
            method = "POST";

            formData.append("user_id", String(userId));
            formData.append(
                "companyprofile_id",
                String(existingProject.companyprofile_id)
            );

            // Placeholder PNG because the backend requires an image
            const pngBase64 =
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC";

            const imageBytes = Uint8Array.from(
                atob(pngBase64),
                (character) => character.charCodeAt(0)
            );

            const imageFile = new File(
                [imageBytes],
                "placeholder.png",
                { type: "image/png" }
            );

            formData.append("project_image", imageFile);

        } else {
            // UPDATE IDP
            url = `${API}/update_project`;
            method = "PATCH";

            const originalProject = allProjects.find(
                (project) =>
                    project.project_id === editingIDPId &&
                    Number(project.user_id) === userId
            );

            if (!originalProject) {
                throw new Error("Original project not found.");
            }

            // Existing backend uses project_name to locate the project
            if (newIDP.title.trim() !== originalProject.project_name) {
                throw new Error(
                    "Renaming a project is not supported by the current update API."
                );
            }
        }

        const response = await fetch(url, {
            method,
            body: formData,
            credentials: "include"
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));

            throw new Error(
                typeof data.detail === "string"
                    ? data.detail
                    : "Failed to save IDP."
            );
        }

        closeNewIDP();
        window.location.reload();

    } catch (error) {
        setFormError(error.message);
    } finally {
        setSavingIDP(false);
    }
}


            return(
                <div className="DesignerPortal_page">
                    <aside className="CompanyProfile_sidebar">
                        <img className="CompanyProfile_brand" src={logo} alt="Logo" />
                        <nav className="CompanyProfile_menu" aria-label="Designer navigation">
                            <NavLink to="/designer_portal" end>Dashboard</NavLink>
                            <NavLink to="/designer_portal/company_profile">Company profile</NavLink>
                            <NavLink to="/designer_portal/my_idps">My IDPs</NavLink>
                            <NavLink to="/designer_portal/my_profile">My profile</NavLink>
                        </nav>
                        <button className="CompanyProfile_signout" type="button" onClick={logout}>
                            Sign out
                        </button>
                    </aside>

                    <div className="CompanyProfile_page">
                        <div className="CompanyProfile_content">
                            <header className="CompanyProfile_header">
                                <h1>Designer Dashboard</h1>
                            </header>

                            {/* Performance overview */}
                            <div className="DD_overview">
                                <span>Performance overview</span>
                            <button
                                type="button"
                                className="DD_newButton"
                                onClick={() => {
                                    setEditingIDPId(null);
                                    setNewIDP({
                                        title: "",
                                        category: "",
                                        status: "Current",
                                        completion_date: "",
                                        description: ""
                                    });
                                    setIdpImages([]);
                                    setImagePreviews([]);
                                    setFormError("");
                                    setShowNewIDP(true);
                                }}
                            >
                                + New IDP
                            </button>
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
                                    <strong>{dashboard?.total_views ?? "—"}</strong>
                                </div>

                                <div className="DD_card DD_stat">
                                    <span>Times shortlisted</span>
                                    <strong>{dashboard?.times_shortlisted ?? "—"}</strong>
                                </div>

                                <div className="DD_card DD_stat">
                                    <span>Current IDPs</span>
                                    <strong>{dashboard?.current_idps ?? "—"}</strong>
                                </div>

                                <div className="DD_card DD_stat">
                                    <span>Past IDPs</span>
                                    <strong>{dashboard?.past_idps ?? "—"}</strong>
                                </div>
                            </section>

                            {/* Chart and Top IDPs */}
                            <section className="DD_middle">
                                <div className="DD_card DD_chartCard">
                                    <h2>Views and shortlists over time</h2>

                                    <div className="DD_chart">
                                        {activity.length > 0 ? (
                                            <div className="DD_chartColumns">
                                                {activity.map(day => (
                                                    <div className="DD_day" key={day.date}>
                                                        <div className="DD_bars">
                                                            <div
                                                                className="DD_bar DD_views"
                                                                title={`${day.date}: ${day.views} views`}
                                                                style={{
                                                                    height: `${(Number(day.views) || 0) / maxActivity * 100}%`
                                                                }}
                                                            />

                                                            <div
                                                                className="DD_bar DD_shortlists"
                                                                title={`${day.date}: ${day.shortlists} shortlists`}
                                                                style={{
                                                                    height: `${(Number(day.shortlists) || 0) / maxActivity * 100}%`
                                                                }}
                                                            />
                                                        </div>

                                                        <small>{String(day.date).slice(5)}</small>
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
                                        <p>{loading ? "Loading..." : "No projects yet"}</p>
                                    )}
                                </div>
                            </section>

                            {/* My IDPs table */}
                            <section className="DD_card DD_projects">
                                <h2>My IDPs</h2>

                                <div className="DD_tableScroll">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Status</th>
                                                <th>Views</th>
                                                <th>Shortlisted</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {projects.length > 0 ? (
                                                projects.map(project => (
                                                    <tr key={project.id}>
                                                        <td>{project.title}</td>
                                                        <td>{project.status}</td>
                                                        <td>{project.views}</td>
                                                        <td>{project.shortlists}</td>

                                                        <td className="DD_actions">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditIDP(project)}
                                                        >
                                                            Edit
                                                        </button>

                                                            <span> · </span>

                                                            <button
                                                                type="button"
                                                                onClick={() => deleteIDP(project)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5}>
                                                        {loading
                                                            ? "Loading projects..."
                                                            : "No IDPs found"}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                        </div>
                    </div>
                
    {/* New IDP Popup */}
    {showNewIDP && (
        <div className="DD_modalOverlay">
            <div className="DD_idpModal">

                <form className="DD_idpForm" onSubmit={saveNewIDP}>

                    {/* Project Details */}
                    <div className="DD_formCard">
                        <h3>Project details</h3>

                        <label>
                            Project title
                            <input
                                type="text"
                                placeholder="Project title"
                                value={newIDP.title}
                                onChange={(e) => setNewIDP({
                                    ...newIDP,
                                    title: e.target.value
                                })}
                                required
                            />
                        </label>
                        <label>
                        Category
                        <input
                            type="text"
                            placeholder="Enter project category"
                            value={newIDP.category}
                            onChange={(e) => setNewIDP({
                                ...newIDP,
                                category: e.target.value
                            })}
                            required
                        />
                        </label>
                        <label>
                            Status
                            <select
                                value={newIDP.status}
                                onChange={(e) => setNewIDP({
                                    ...newIDP,
                                    status: e.target.value
                                })}
                            >
                                <option value="Current">Current</option>
                                <option value="Past">Past</option>
                            </select>
                        </label>

                        <label>
                            Completion date
                            <input
                                type="date"
                                value={newIDP.completion_date}
                                onChange={(e) => setNewIDP({
                                    ...newIDP,
                                    completion_date: e.target.value
                                })}
                            />
                        </label>

                        <label>
                            Description
                            <textarea
                                rows="4"
                                placeholder="Description"
                                value={newIDP.description}
                                onChange={(e) => setNewIDP({
                                    ...newIDP,
                                    description: e.target.value
                                })}
                            />
                        </label>

                        {formError && (
                            <p className="DD_formError">{formError}</p>
                        )}

                        <div className="DD_formActions">
                            <button
                                type="submit"
                                className="DD_saveButton"
                                disabled={savingIDP}
                            >
                            {savingIDP
                                ? "Saving..."
                                : editingIDPId === null
                                    ? "Save IDP"
                                    : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                className="DD_cancelButton"
                                onClick={closeNewIDP}
                                disabled={savingIDP}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>

            </div>
        </div>
    )}


                </div>
            )
        }

        export default DesignerPortal;
