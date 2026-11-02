
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
                    const response = await fetch(`${API}/designer/dashboard`, {
                        signal: controller.signal,
                        credentials: "include",
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    const result = await response.json();

                    if (!controller.signal.aborted) {
                        setDashboard(result);
                    }
                } catch (err) {
                    if (!controller.signal.aborted) {
                        setError("Could not load designer dashboard from FastAPI.");
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
                const response = await fetch(`${API}/idps/${project.id}`, {
                    method: "DELETE",
                    credentials: "include"
                });

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
                    const response = await fetch(`${API}/idps/${project.id}`, {
                        credentials: "include"
                    });

                    if (!response.ok) {
                        throw new Error("Unable to load IDP information.");
                    }

                    const data = await response.json();

                    setNewIDP({
                        title: data.title || "",
                        category: data.category || "",
                        status: data.status || "Current",
                        completion_date: data.completion_date
                            ? String(data.completion_date).slice(0, 10)
                            : "",
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

                const formData = new FormData();
                formData.append("title", newIDP.title);
                formData.append("category", newIDP.category.trim());
                formData.append("status", newIDP.status);
                formData.append("completion_date", newIDP.completion_date);
                formData.append("description", newIDP.description);

                idpImages.forEach(file => {
                    formData.append("images", file);
                });

                try {
                const response = await fetch(
                    editingIDPId === null
                        ? `${API}/idps`
                        : `${API}/idps/${editingIDPId}`,
                    {
                        method: editingIDPId === null ? "POST" : "PUT",
                        body: formData,
                        credentials: "include"
                    }
                );

                    if (!response.ok) {
                        throw new Error("Failed to save IDP.");
                    }

                    closeNewIDP();
                    setEditingIDPId(null);
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

                {/* Project Images */}
                <div className="DD_formCard DD_imagesCard">
                    <h3>Project images</h3>

                    <div className="DD_imageGrid">
                        {[0, 1, 2, 3].map(index => (
                            <div className="DD_imageBox" key={index}>
                                {imagePreviews[index] ? (
                                    <img
                                        src={imagePreviews[index]}
                                        alt={`Project image ${index + 1}`}
                                    />
                                ) : (
                                    <span>Img</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <label className="DD_uploadButton">
                        Upload images
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleIDPImages}
                            hidden
                        />
                    </label>
                </div>

            </form>

        </div>
    </div>
)}


            </div>
        )
    }

    export default DesignerPortal;
