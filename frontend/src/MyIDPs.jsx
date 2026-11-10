
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "./Image/logo.png";
import "./designerportal.css";
import "./MyIDPs.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function MyIDPs({ logout }) {

    const navigate = useNavigate();
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
    const [viewingIDP, setViewingIDP] = useState(null);
    const [savingIDP, setSavingIDP] = useState(false);
    const [formError, setFormError] = useState("");
    const [showNewIDP, setShowNewIDP] = useState(false);
    const [newIDP, setNewIDP] = useState({
        title: "",
        category: "",
        status: "Current",
        completion_date: "",
        description: ""
    });
    const [editIDP, setEditIDP] = useState({
        title: "",
        category: "",
        status: "Current",
        completion_date: "",
        description: ""
    });

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

    const [idpCategories, setIDPCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoryError, setCategoryError] = useState("");

        useEffect(() => {
            loadIDPs();
        }, []);

        useEffect(() => {
            const controller = new AbortController();

            async function loadCategories() {
                try {
                    setCategoryError("");

                    const response = await fetch(`${API}/get_all_idpcategory`, {
                        credentials: "include",
                        signal: controller.signal
                    });

                    if (!response.ok) {
                        throw new Error("Unable to load IDP categories.");
                    }

                    const data = await response.json();

                    if (!Array.isArray(data)) {
                        throw new Error("Unexpected category response format.");
                    }

                    setIDPCategories(data);
                } catch (err) {
                    if (err.name !== "AbortError") {
                        setCategoryError(err.message);
                    }
                } finally {
                    if (!controller.signal.aborted) {
                        setCategoriesLoading(false);
                    }
                }
            }

            loadCategories();

            return () => controller.abort();
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
    // Open View popup
    function openViewIDP(project) {
        setViewingIDP(project);
    }

    // Close View popup
    function closeViewIDP() {
        setViewingIDP(null);
    }    
    // Check Company Profile when New IDP is clicked
    async function handleNewIDPClick() {
        const userId = Number(localStorage.getItem("currentUserId"));

        if (!userId) {
            alert("Designer user ID not found.");
            return;
        }

        try {
            const response = await fetch(
                `${API}/get_companyprofile/${userId}`,
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Unable to retrieve Company Profile.");
            }

            const data = await response.json();

            // No Company Profile: Redirect to Company Profile page
            if (!data.company_profile?.companyprofile_id) {
                navigate("/designer_portal/company_profile");
                return;
            }

            // Company Profile exists: Open New IDP popup
            openNewIDP();

        } catch (err) {
            alert(err.message);
        }
    }
    // Open New IDP popup
    function openNewIDP() {
        setNewIDP({
            title: "",
            category: "",   
            status: "Current",
            completion_date: "",
            description: ""
    });

    setFormError("");
    setShowNewIDP(true);
}

    // Close New IDP popup
    function closeNewIDP() {
        setShowNewIDP(false);
        setFormError("");

        setNewIDP({
            title: "",
            category: "",
            status: "Current",
            completion_date: "",
            description: ""
        });
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

        setFormError("");
        setEditingIDPId(project.id);
    }
    // Close Edit popup
    function closeEditIDP() {
        if (savingIDP) return;

        setEditingIDPId(null);
        setFormError("");
    }
    // Save New IDP into PostgreSQL
    async function saveNewIDP(event) {
        event.preventDefault();

        // Check Description before saving
        if (!newIDP.description.trim()) {
            setFormError("Please fill in the description");
            return;
        }

        setFormError("");
        setSavingIDP(true);

        try {
            const userId = Number(
                localStorage.getItem("currentUserId")
            );

            if (!userId) {
                throw new Error("Designer user ID not found.");
            }

            // Retrieve the designer's Company Profile directly
            const companyResponse = await fetch(
                `${API}/get_companyprofile/${userId}`,
                {
                    credentials: "include"
                }
            );

            if (!companyResponse.ok) {
                throw new Error(
                    "Unable to retrieve company profile."
                );
            }

            const companyData = await companyResponse.json();

            const companyProfile = companyData.company_profile;

            if (!companyProfile?.companyprofile_id) {
                throw new Error(
                    "Please create your Company Profile before adding a new IDP."
                );
            }

            const projectData = {
                user_id: userId,
                companyprofile_id: Number(companyProfile.companyprofile_id),
                project_name: newIDP.title.trim(),
                description: newIDP.description.trim(),
                category_code: newIDP.category.trim(),
                status: newIDP.status === "Current"
                    ? "ONGOING"
                    : "COMPLETED"
            };

            const response = await fetch(
                `${API}/create_project`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(projectData),
                    credentials: "include"
                }
            );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));

            console.error("Create IDP error:", response.status, data);

            let errorMessage = `Failed to save IDP (HTTP ${response.status})`;

            if (typeof data.detail === "string") {
                errorMessage = data.detail;
            } else if (Array.isArray(data.detail)) {
                errorMessage = data.detail
                    .map(error => {
                        const field = error.loc?.join(".") || "Unknown field";
                        return `${field}: ${error.msg}`;
                    })
                    .join("\n");
            } else if (data.message) {
                errorMessage = data.message;
            }

            throw new Error(errorMessage);
        }

            closeNewIDP();
            window.location.reload();

        } catch (err) {
            setFormError(err.message);
        } finally {
            setSavingIDP(false);
        }
    }

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

            const updates = {
                project_name: editIDP.title.trim(),
                category_code: editIDP.category.trim(),
                description: editIDP.description.trim(),
                status: editIDP.status === "Current"
                    ? "ONGOING"
                    : "COMPLETED"
            };

            const response = await fetch(
                `${API}/update_project?project_name=${encodeURIComponent(originalProject.title)}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updates),
                    credentials: "include"
                }
            );

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
            {/* Search Bar and New IDP Button */}
            <div className="MyIDPs_searchActions">

                <div className="MyIDPs_searchBar">
                    <input
                        type="text"
                        placeholder="Search project name..."
                        aria-label="Search project name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className="DD_newButton"
                    onClick={handleNewIDPClick}
                >
                    + New IDP
                </button>

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
                                            className="IDP_viewButton"
                                            onClick={() => openViewIDP(project)}
                                            title="View project details"
                                            aria-label="View project details"
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>

                                            <span> · </span>

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
            {/* View IDP Popup */}
            {viewingIDP && (
                <div className="DD_modalOverlay">
                    <div
                        className="DD_idpModal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="View IDP"
                    >
                        <form
                            className="DD_idpForm"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <div className="DD_formCard">

                                <h3>Project details</h3>

                                <label>
                                    Project title
                                    <input
                                        type="text"
                                        value={viewingIDP.title || ""}
                                        readOnly
                                    />
                                </label>

                                <label>
                                    Category
                                    <input
                                        type="text"
                                        value={viewingIDP.category || ""}
                                        readOnly
                                    />
                                </label>

                                <label>
                                    Status
                                    <input
                                        type="text"
                                        value={
                                            viewingIDP.status === "ONGOING"
                                                ? "Current"
                                                : viewingIDP.status === "COMPLETED"
                                                    ? "Past"
                                                    : viewingIDP.status || ""
                                        }
                                        readOnly
                                    />
                                </label>

                                <label>
                                    Description
                                    <textarea
                                        rows="4"
                                        value={viewingIDP.description || ""}
                                        readOnly
                                    />
                                </label>

                                <label>
                                    Total Views
                                    <input
                                        type="text"
                                        value={viewingIDP.views ?? 0}
                                        readOnly
                                    />
                                </label>

                                <label>
                                    Times Shortlisted
                                    <input
                                        type="text"
                                        value={viewingIDP.shortlists ?? 0}
                                        readOnly
                                    />
                                </label>

                                <div className="DD_formActions">
                                    <button
                                        type="button"
                                        className="DD_cancelButton"
                                        onClick={closeViewIDP}
                                    >
                                        Close
                                    </button>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* New IDP Popup */}
            {showNewIDP && (
                <div className="DD_modalOverlay">
                    <div className="DD_idpModal">

                        <form
                            className="DD_idpForm"
                            onSubmit={saveNewIDP}
                        >

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
                                    <select
                                        value={newIDP.category}
                                        onChange={(e) => setNewIDP({
                                            ...newIDP,
                                            category: e.target.value
                                        })}
                                        disabled={
                                            categoriesLoading ||
                                            !!categoryError ||
                                            idpCategories.length === 0
                                        }
                                        required
                                    >
                                        <option value="">
                                            {categoriesLoading
                                                ? "Loading categories..."
                                                : "Select a category"}
                                        </option>

                                        {idpCategories.map(category => (
                                            <option
                                                key={category.category_id}
                                                value={category.category_code}
                                            >
                                                {category.category_code}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {categoryError && (
                                    <p className="DD_formError">
                                        {categoryError}
                                    </p>
                                )}                               

                                <label>
                                    Status
                                    <select
                                        value={newIDP.status}
                                        onChange={(e) => setNewIDP({
                                            ...newIDP,
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
                                        placeholder="Description"
                                        value={newIDP.description}
                                        onChange={(e) => setNewIDP({
                                            ...newIDP,
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
                                            : "Save IDP"}
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
