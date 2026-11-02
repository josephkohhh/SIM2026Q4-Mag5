
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
        try {
            setError("");

            const response = await fetch(`${API}/designer/dashboard`, {
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Unable to load IDPs.");
            }

            const data = await response.json();

            setProjects(
                Array.isArray(data.idps) ? data.idps : []
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
            const response = await fetch(`${API}/idps/${project.id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Unable to delete IDP."
                );
            }

            // Remove the deleted IDP from the table
            setProjects(previous =>
                previous.filter(item => item.id !== project.id)
            );

        } catch (err) {
            window.alert(err.message);
        }
    }

    // Open Edit popup
    async function openEditIDP(project) {

        try {
            const response = await fetch(`${API}/idps/${project.id}`, {
                credentials: "include"
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Unable to load IDP information."
                );
            }

            const data = await response.json();

            // Fill the form using existing PostgreSQL data
            setEditIDP({
                title: data.title || "",
                category: data.category || "",
                status: data.status || "Current",
                completion_date: data.completion_date
                    ? String(data.completion_date).slice(0, 10)
                    : "",
                description: data.description || ""
            });

            setIdpImages([]);
            setImagePreviews([]);
            setFormError("");
            setEditingIDPId(project.id);

        } catch (err) {
            window.alert(err.message);
        }
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
    async function saveEditIDP(event) {

        event.preventDefault();

        if (savingIDP || editingIDPId === null) return;

        setSavingIDP(true);
        setFormError("");

        const formData = new FormData();

        formData.append("title", editIDP.title.trim());
        formData.append("category", editIDP.category.trim());
        formData.append("status", editIDP.status);
        formData.append("completion_date", editIDP.completion_date);
        formData.append("description", editIDP.description);

        idpImages.forEach(file => {
            formData.append("images", file);
        });

        try {
            const response = await fetch(
                `${API}/idps/${editingIDPId}`,
                {
                    method: "PUT",
                    body: formData,
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

            setEditingIDPId(null);
            setIdpImages([]);
            setImagePreviews([]);

            // Reload updated IDPs from PostgreSQL
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

                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        No IDPs found.
                                    </td>
                                </tr>

                            ) : (
                                projects.map(project => (

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
                                    Completion date
                                    <input
                                        type="date"
                                        value={editIDP.completion_date}
                                        onChange={e => setEditIDP({
                                            ...editIDP,
                                            completion_date: e.target.value
                                        })}
                                    />
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

                            {/* Project Images */}
                            <div className="DD_formCard DD_imagesCard">

                                <h3>Project images</h3>

                                <div className="DD_imageGrid">

                                    {[0, 1, 2, 3].map(index => (

                                        <div
                                            className="DD_imageBox"
                                            key={index}
                                        >

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
                                    Upload replacement images

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
    );
}

export default MyIDPs;
