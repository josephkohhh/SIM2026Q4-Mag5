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
                const email = localStorage.getItem("currentEmail");

                if (!email) {
                    throw new Error("Please log in again.");
                }

                const response = await fetch(
                    `http://localhost:8000/get_useracount/${encodeURIComponent(email)}`,
                    {
                        credentials: "include",
                        signal: controller.signal,
                    }
                );

                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(typeof data?.detail === "string" ? data.detail : "Failed to load your profile. Please try again.");
                }
                if (!data || !Number.isInteger(data.user_id)) {
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
            const response = await fetch(
                `http://localhost:8000/update_useraccount?email=${encodeURIComponent(user.email)}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(typeof data?.detail === "string" ? data.detail : "Unable to update your profile. Please try again.");
            }

            onProfileUpdated({
                ...user,
                name: formData.name,
                surname: formData.surname,
                phone_no: formData.phone_no,
                email: formData.email ?? user.email,
            });
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
