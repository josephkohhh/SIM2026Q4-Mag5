function Categorypanel({
    mode,
    category,
    name,
    description,
    onNameChange,
    onDescriptionChange,
    onSubmit,
    onClose,
    saving,
    error,
}) {
    if (!mode) return null;

    const isForm = mode === "create" || mode === "edit";

    const title = {
        create: "Create Category",
        edit: "Edit Category",
        view: "Category Details",
    }[mode];

    return (
        <div
            id="PM_category_details"
            className="PM_categoryDetails"
            role="region"
            aria-label={title}
        >
            <div className="PM_categoryDetailsHeader">
                <h2>{title}</h2>

                <button
                    type="button"
                    className="PM_closeDetails"
                    aria-label="Close category details"
                    disabled={saving}
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            {isForm ? (
                <form onSubmit={onSubmit} className="PM_editForm">
                    <label htmlFor="PM_category_name">
                        Category Name
                    </label>

                    <input
                        id="PM_category_name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                            onNameChange(event.target.value)
                        }
                        maxLength={100}
                        required
                        disabled={saving}
                    />

                    <label htmlFor="PM_category_description">
                        Description
                    </label>

                    <textarea
                        id="PM_category_description"
                        value={description}
                        onChange={(event) =>
                            onDescriptionChange(event.target.value)
                        }
                        rows={7}
                        disabled={saving}
                    />

                    {error && (
                        <p className="PM_saveError" role="alert">
                            {error}
                        </p>
                    )}

                    <div className="PM_editButtons">
                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <h3>Category Name</h3>
                    <p>{category?.category_code}</p>

                    <h3>Description</h3>
                    <p>
                        {category?.description ||
                            "No description available."}
                    </p>
                </>
            )}
        </div>
    );
}

export default Categorypanel;