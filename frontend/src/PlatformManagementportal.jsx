import { Link } from "react-router-dom";
import "./PlatformManagementportal.css";
import logo from './Image/logo.png'
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Categorypanel from "./Component/Categorypanel";

function PlatformManagementportal({logout}) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [mode, setMode] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    
    useEffect(() => {
    const controller = new AbortController();

    async function getCategories() {
        try {
            const response = await fetch("http://localhost:8000/get_all_idpcategory", {
            signal: controller.signal,
            });

            if (!response.ok) {
            throw new Error(`ErrorCode: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
            throw new Error("Data return are not array");
            }

            setCategories(data);
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

        getCategories();
        return () => controller.abort();
    }, []);
    
    {/* Filter function*/}
    const filteredCategories = categories.filter((category) => {
        const keyword = search.trim().toLowerCase();
        const categoryName = String(category.category_code ?? "").toLowerCase();

        return categoryName.includes(keyword);
    });

    {/* Control number of user show in list */}
    const totalPages = Math.max(1, Math.ceil(filteredCategories.length  / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentCategories = filteredCategories.slice(startIndex, startIndex + pageSize);

    function openView(category) {
        setSelectedCategory(category);
        setMode("view");
        setSaveError("");
    }

    function openCreate() {
        setSelectedCategory(null);
        setEditName("");
        setEditDescription("");
        setMode("create");
        setSaveError("");
    }

    function openEdit(category) {
        setSelectedCategory(category);
        setEditName(category.category_code ?? "");
        setEditDescription(category.description ?? "");
        setMode("edit");
        setSaveError("");
    }

    function closePanel() {
        setSelectedCategory(null);
        setMode(null);
        setEditName("");
        setEditDescription("");
        setSaveError("");
    }

    async function saveCategory(event) {
        event.preventDefault();

        const creating = mode === "create";

        if (saving) return;
        if (!creating && (mode !== "edit" || !selectedCategory)) return;

        const name = editName.trim();

        if (!name) { setSaveError("Category name cannot be empty.");return;}

        setSaving(true);
        setSaveError("");

        try {
            const url = creating
                ? "http://localhost:8000/create_idpcategory"
                : `http://localhost:8000/update_idpcategory?category_code=${encodeURIComponent(selectedCategory.category_code)}`;

            const response = await fetch(url, {
                method: creating ? "POST" : "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    category_code: name,
                    description: editDescription,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const message = Array.isArray(data.detail)
                    ? data.detail
                        .map((item) => `${item.loc.join(".")}: ${item.msg}`)
                        .join("\n")
                    : typeof data.detail === "string"
                        ? data.detail
                        : "Unable to save category.";

                throw new Error(message);
            }

            if (creating) {
                setCategories((previous) => [...previous, data]);
                setSearch("");
                setCurrentPage(
                    Math.max(1, Math.ceil((categories.length + 1) / pageSize))
                );
            } else {
                setCategories((previous) =>
                    previous.map((category) =>
                        category.category_id === data.category_id
                            ? data
                            : category
                    )
                );

                setCurrentPage(1);
            }

            closePanel();
        } catch (err) {
            setSaveError(err.message || "Unable to save category.");
        } finally {
            setSaving(false);
        }
    }

    async function deleteCategory(category) {
        if (deletingId !== null) return;

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${category.category_code}?`
        );

        if (!confirmDelete) return;

        setDeletingId(category.category_id);

        try {
            const response = await fetch(
                `http://localhost:8000/delete_category/${encodeURIComponent(category.category_code)}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.detail || "Unable to delete category.");
            }

            setCategories((previous) =>
                previous.filter(
                    (item) => item.category_id !== category.category_id
                )
            );

            setCurrentPage((page) =>
                Math.min(
                    page,
                    Math.max(1, Math.ceil((filteredCategories.length - 1) / pageSize))
                )
            );

            if (selectedCategory?.category_id === category.category_id) {
                closePanel();
            }

        } catch (err) {
            alert(err.message || "Unable to delete category.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="PM_page">
        <aside className="PM_navbar">
            <img src={logo} alt="LOGO"></img>

            <nav className="PM_menu">
                <Link to="/management_portal" className="active">Categories</Link>
                <Link to="/management_portal/report">Report</Link>
            </nav>

            <button type="button" className="signout" onClick={logout}>Sign out</button>
        </aside>

        <main className="PM_content">
            <header className="PM_header">
            <h1>PlatForm Management Dashboard</h1>
            </header>

            <div className="PM_columns">
            <section className="PM_users">
                <div className="PM_filters">
                    <input
                        placeholder="Search category name"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="PM_table">
                <table>
                    <colgroup>
                        <col style={{ width: "60px" }} />
                        <col style={{ width: "25%" }} />
                        <col />
                        <col style={{ width: "210px" }} />
                    </colgroup>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Categories</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (<tr><td colSpan={4}>Loading...</td></tr>
                    ) : error ? (<tr><td colSpan={4}>{error}</td></tr>
                    ) : filteredCategories.length === 0 ? (<tr><td colSpan={5}>No categories found</td></tr>
                    ) : ( currentCategories.map((category) => (
                        <tr key={category.category_id}>
                            <td>{category.category_id}</td>
                            <td>
                                <span className="PM_truncate">
                                    {category.category_code}
                                </span>
                            </td>
                            <td>    
                                <span className="PM_truncate">
                                    {category.description ?? ""}
                                </span>
                            </td>
                            <td>
                                <div className="PM_actions">
                                    <button
                                        type="button"
                                        className="action_view"
                                        aria-label={`View ${category.category_code}`}
                                        aria-expanded={mode === "view" && selectedCategory?.category_id === category.category_id}
                                        aria-controls="PM_category_details"
                                        disabled={saving}
                                        onClick={() => openView(category)}
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <div className="PM_actionGroup">
                                        <button
                                            type="button"
                                            className="action_edit"
                                            disabled={saving}
                                            onClick={() => openEdit(category)}
                                        >
                                            Edit
                                        </button>

                                            <button
                                                type="button"
                                                className="action_delete"
                                                disabled={saving || deletingId !== null}
                                                onClick={() => deleteCategory(category)}>
                                                {deletingId === category.category_id ? "Deleting..." : "Delete"}
                                            </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                {!loading && !error && filteredCategories.length  > 0 && (
                    <div className="PM_pagination">
                        <button type="button"disabled={currentPage === 1}onClick={() => setCurrentPage((page) => page - 1)}>Previous</button>
                        <span>Page {currentPage} of {totalPages} </span>
                        <button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => page + 1)}> Next </button>
                    </div>
                )}
                </div>
            </section>
                <section className="PM_profile">
                    <button
                        type="button"
                        className="createuser_btn"
                        disabled={saving || loading || Boolean(error)}
                        onClick={openCreate}
                    >
                        + Create Categories
                    </button>

                    <Categorypanel
                        mode={mode}
                        category={selectedCategory}
                        name={editName}
                        description={editDescription}
                        onNameChange={setEditName}
                        onDescriptionChange={setEditDescription}
                        onSubmit={saveCategory}
                        onClose={closePanel}
                        saving={saving}
                        error={saveError}
                    />
                </section>
            
            </div>
        </main>
        </div>
    );
}

export default PlatformManagementportal;