import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserForm from "./Component/UserForm";
import "./edituser.css";
import "./designerprofile.css";

function DesignerProfile({ onProfileUpdated }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        async function loadUser() {
            try {
                const response = await fetch("http://localhost:8000/designer-profile", {
                    credentials: "include",
                    signal: controller.signal,
                });
                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(typeof data?.detail === "string" ? data.detail : "Failed to load your profile. Please try again.");
                }
                if (!data || !Number.isInteger(data.id)) {
                    throw new Error("Invalid profile response. Please try again.");
                }
                if (!controller.signal.aborted) {
                    setUser(data);
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

        loadUser();
        return () => controller.abort();
    }, []);

    async function handleEdit(formData) {
        if (saving) return;
        setSaving(true);

        try {
            const response = await fetch("http://localhost:8000/designer-profile", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(typeof data?.detail === "string" ? data.detail : "Unable to update your profile. Please try again.");
            }

            onProfileUpdated(data);
            alert("Your profile has been updated successfully.");
            navigate("/designer_portal");
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="edituser_panel DesignerProfile_page">
            <div className="edituser_form DesignerProfile_form">
                <Link to="/designer_portal" className="DesignerProfile_back">Back</Link>
                <h1>My Profile</h1>

                {loading && <p role="status">Loading your profile...</p>}
                {error && <p role="alert">{error}</p>}
                {!loading && !error && user && (
                    <>
                        <fieldset className="DesignerProfile_fields" disabled={saving}>
                            <UserForm buttonText={saving ? "Saving..." : "Save"}
                                onSubmit={handleEdit} initialData={user} isEdit={true} isSelfEdit={true} />
                        </fieldset>
                    </>
                )}
            </div>
        </main>
    );
}

export default DesignerProfile;
