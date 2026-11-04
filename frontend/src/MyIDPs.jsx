
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "./Image/logo.png";
import "./designerportal.css";
import "./MyIDPs.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function MyIDPs({ logout }) {

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // Search projects by project name only
    const filteredProjects = projects.filter(project =>
        String(project.title || "")
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );
    // Edit popup
    const [editingIDPId, setEditingIDPId] = useState(null);
    const [savingIDP, setSavingIDP] = useState(false);
    const [formError, setFormError] = useState("");

    const [editIDP, setEditIDP] = useState({
        title: "",
        category: "",
        status: "Current",
        completion_date: "",
        description: ""
    });

    const [idpImages, setIdpImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

// Load IDPs from FastAPI
async function loadIDPs() {
    setLoading(true);

    try {
        setError("");

        const response = await fetch(`${API}/get_all_project`, {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Unable to load IDPs.");
        }

        const allProjects = await response.json();
        const userId = Number(localStorage.getItem("currentUserId"));

        if (!userId) {
            throw new Error("Designer user ID not found.");
        }

        // Get projects belonging to the logged-in designer
        const myProjects = allProjects.filter(
            project => Number(project.user_id) === userId
        );

        // Retrieve views and shortlists for every project
        const projectsWithStats = await Promise.all(
            myProjects.map(async project => {

                const [viewResponse, shortlistResponse] = await Promise.all([
                    fetch(`${API}/get_projectview/${project.project_id}`, {
                        credentials: "include"
                    }),
                    fetch(`${API}/get_shortlistcount/${project.project_id}`, {
                        credentials: "include"
                    })
                ]);

                if (!viewResponse.ok || !shortlistResponse.ok) {
                    throw new Error("Unable to load project statistics.");
                }

                const viewData = await viewResponse.json();
                const shortlistData = await shortlistResponse.json();

                return {
                    id: project.project_id,
                    title: project.project_name,
                    category: project.category_code,
                    description: project.description,
                    status: project.status,
                    views: Number(viewData.view_count ?? 0),
                    shortlists: Number(shortlistData.shortlist_count ?? 0)
                };
            })
        );

        setProjects(
            [...projectsWithStats].sort((a, b) => a.id - b.id)
        );

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}

    useEffect(() => {
        loadIDPs();
    }, []);

    // Delete IDP

    async function deleteIDP(project) {

        if (!window.confirm(`Delete "${project.title}"?`)) {
            return;
        }

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

                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Unable to delete IDP."
                );
            }

            setProjects(previous =>
                previous.filter(item => item.id !== project.id)
            );

        } catch (err) {
            window.alert(err.message);
        }
    }    

    // Open Edit popup
    function openEditIDP(project) {

        setEditIDP({
            title: project.title,
            category: project.category || "",
            status: project.status === "ONGOING" ? "Current" : "Past",
            completion_date: "",
            description: project.description || ""
        });

        setIdpImages([]);
        setImagePreviews([]);
        setFormError("");
        setEditingIDPId(project.id);
    }
    // Close Edit popup
    function closeEditIDP() {
        if (savingIDP) return;

        setEditingIDPId(null);
        setFormError("");
        setIdpImages([]);
        setImagePreviews([]);
    }

    // Upload images
    async function handleIDPImages(event) {

        const files = Array.from(event.target.files || []);

        if (files.length > 4) {
            setFormError("Maximum 4 images allowed.");
            event.target.value = "";
            return;
        }

        setFormError("");
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

    // Save edited IDP into PostgreSQL
// Save edited IDP into PostgreSQL
    async function saveEditIDP(event) {

        event.preventDefault();

        if (savingIDP || editingIDPId === null) return;

        setSavingIDP(true);
        setFormError("");

        try {
            const originalProject = projects.find(
                project => Number(project.id) === Number(editingIDPId)
            );

            if (!originalProject) {
                throw new Error("Original IDP not found.");
            }

            if (
                !editIDP.title.trim() ||
                !editIDP.category.trim() ||
                !editIDP.description.trim()
            ) {
                throw new Error(
                    "Project title, category and description are required."
                );
            }

            const formData = new FormData();

            // Original title identifies the project
            formData.append(
                "original_project_name",
                originalProject.title
            );

            // New title and other updated values
            formData.append(
                "project_name",
                editIDP.title.trim()
            );

            formData.append(
                "category_code",
                editIDP.category.trim()
            );

            formData.append(
                "description",
                editIDP.description.trim()
            );

            // Current -> ONGOING, Past -> COMPLETED
            formData.append(
                "status",
                editIDP.status === "Current"
                    ? "ONGOING"
                    : "COMPLETED"
            );

            const response = await fetch(`${API}/update_project`, {
                method: "PATCH",
                body: formData,
                credentials: "include"
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Unable to update IDP."
                );
            }

            // Close popup
            setEditingIDPId(null);
            setIdpImages([]);
            setImagePreviews([]);

            // Refresh table with latest PostgreSQL data
            await loadIDPs();

        } catch (err) {
            setFormError(err.message);
        } finally {
            setSavingIDP(false);
        }
    }

    return (
        <div className="MyIDPs_page">

            {/* Existing Designer Sidebar */}
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

            {/* My IDPs Page */}
            <main className="MyIDPs_main">

                <h1>My IDPs</h1>

                <div className="MyIDPs_searchBar">
                    <input
                        type="text"
                        placeholder="Search project name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="MyIDPs_tableContainer">

                    <table className="MyIDPs_table">

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

                            {loading ? (
                                <tr>
                                    <td colSpan={5}>
                                        Loading IDPs...
                                    </td>
                                </tr>

                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        {search.trim()
                                            ? "No matching projects found."
                                            : "No IDPs found."}
                                    </td>
                                </tr>

                            ) : (
                                filteredProjects.map(project => (

                                    <tr key={project.id}>

                                        <td>{project.title}</td>

                                        <td>{project.status}</td>

                                        <td>{project.views}</td>

                                        <td>{project.shortlists}</td>

                                        <td className="MyIDPs_actions">

                                            <button
                                                type="button"
                                                onClick={() => openEditIDP(project)}
                                            >
                                                Edit
                                            </button>

                                            <span> · </span>

                                            <button
                                                type="button"
                                                className="MyIDPs_delete"
                                                onClick={() => deleteIDP(project)}
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

                {error && (
                    <p className="MyIDPs_error">
                        {error}
                    </p>
                )}

            </main>

            {/* Edit IDP Popup */}
            {editingIDPId !== null && (

                <div className="DD_modalOverlay">

                    <div
                        className="DD_idpModal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Edit IDP"
                    >

                        <form
                            className="DD_idpForm"
                            onSubmit={saveEditIDP}
                        >

                            {/* Project Details */}
                            <div className="DD_formCard">

                                <h3>Project details</h3>

                                <label>
                                    Project title
                                    <input
                                        type="text"
                                        value={editIDP.title}
                                        onChange={e => setEditIDP({
                                            ...editIDP,
                                            title: e.target.value
                                        })}
                                        required
                                    />
                                </label>

                                <label>
                                    Category
                                    <input
                                        type="text"
                                        value={editIDP.category}
                                        onChange={e => setEditIDP({
                                            ...editIDP,
                                            category: e.target.value
                                        })}
                                        required
                                    />
                                </label>

                                <label>
                                    Status
                                    <select
                                        value={editIDP.status}
                                        onChange={e => setEditIDP({
                                            ...editIDP,
                                            status: e.target.value
                                        })}
                                    >
                                        <option value="Current">
                                            Current
                                        </option>

                                        <option value="Past">
                                            Past
                                        </option>
                                    </select>
                                </label>

                                <label>
                                    Description
                                    <textarea
                                        rows="4"
                                        value={editIDP.description}
                                        onChange={e => setEditIDP({
                                            ...editIDP,
                                            description: e.target.value
                                        })}
                                    />
                                </label>

                                {formError && (
                                    <p className="DD_formError">
                                        {formError}
                                    </p>
                                )}

                                <div className="DD_formActions">

                                    <button
                                        type="submit"
                                        className="DD_saveButton"
                                        disabled={savingIDP}
                                    >
                                        {savingIDP
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                    <button
                                        type="button"
                                        className="DD_cancelButton"
                                        onClick={closeEditIDP}
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
    );
}

export default MyIDPs;
