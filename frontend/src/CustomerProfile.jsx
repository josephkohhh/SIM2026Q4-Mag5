import { useEffect, useState } from "react";
import "./customerprofile.css";

function personalDetails(user) {
    return {
        firstname: user.name ?? "",
        lastname: user.surname ?? "",
        email: user.email ?? "",
        phonenum: user.phone_no ?? "",
    };
}

async function readResponse(response) {
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(typeof data?.detail === "string" ? data.detail : "Unable to save your changes. Please check the form and try again.");
    }
    return data;
}

function CustomerProfile({ onProfileUpdated }) {
    const [user, setUser] = useState(null);
    const [details, setDetails] = useState({ firstname: "", lastname: "", email: "", phonenum: "" });
    const [passwords, setPasswords] = useState({ current_password: "", new_password: "", confirm_password: "" });
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [savingDetails, setSavingDetails] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

useEffect(() => {
  const controller = new AbortController();

    async function loadProfile() {
        setLoading(true);
        setLoadError("");

        try {
        const currentEmail = localStorage.getItem("currentEmail");

        if (!currentEmail) {
            throw new Error("Please log in first.");
        }

        const response = await fetch(
            `http://127.0.0.1:8000/get_useracount/${encodeURIComponent(currentEmail)}`,
            {
            method: "GET",
            signal: controller.signal,
            }
        );

        const data = await readResponse(response);
        if (!data || !Number.isInteger(data.user_id)) {
            throw new Error("Unable to load your profile.");
        }
        if (!controller.signal.aborted) {
            setUser(data);
            setDetails(personalDetails(data));
        }
        } catch (error) {
        if (!controller.signal.aborted) {
            setLoadError(error.message);
        }
        } finally {
        if (!controller.signal.aborted) {
            setLoading(false);
        }
        }
    }
    loadProfile();
    return () => controller.abort();
    }, []);

    function changeDetail(event) {
        const { name, value } = event.target;
        setDetails((previous) => ({ ...previous, [name]: value }));
    }

    function changePassword(event) {
        const { name, value } = event.target;
        setPasswords((previous) => ({ ...previous, [name]: value }));
    }

    async function patchAccount(email, updates) {
        const params = new URLSearchParams({ email });

        const response = await fetch(
            `http://localhost:8000/update_useraccount?${params}`,
            {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
            }
        );

        return readResponse(response);
    }

    async function updatePersonalInformation(event) {
        event.preventDefault();

        if (savingDetails || savingPassword || !user) return;
        setSavingDetails(true);

        try {
            const updates = {
            name: details.firstname.trim(),
            surname: details.lastname.trim(),
            email: details.email.trim(),
            phone_no: details.phonenum.trim(),
            };

            const data = await patchAccount(user.email, updates);
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            setDetails(personalDetails(updatedUser));
            localStorage.setItem("currentEmail", updatedUser.email);
            onProfileUpdated?.(updatedUser);

            alert(data?.message || "Your personal information has been updated.");
        } catch (error) {
            alert(error.message);
        } finally {
            setSavingDetails(false);
        }
    }

    async function updatePassword(event) {
        event.preventDefault();

        if (!user || savingPassword || savingDetails) return;
        if (!passwords.current_password || !passwords.new_password) {
            alert("Please enter your current and new passwords.");
            return;
        }
        if (passwords.new_password !== passwords.confirm_password) {
            alert("The new passwords do not match.");
            return;
        }
        setSavingPassword(true);
        try {
            const response = await fetch(
            `http://localhost:8000/update_useraccount?email=${encodeURIComponent(user.email)}`,
            {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                current_password: passwords.current_password,
                password: passwords.new_password,
                }),
            }
            );
            const data = await readResponse(response);
            setPasswords({
            current_password: "",
            new_password: "",
            confirm_password: "",
            });

            alert(data?.message || "Your password has been updated.");
        } catch (error) {
            alert(error.message);
        } finally {
            setSavingPassword(false);
        }
    }

    function cancelChanges() {
        setDetails(personalDetails(user));
    }

    return (
        <main className="customer-profile-page">
            <div className="customer-profile-content">
                <h1>My profile</h1>
                {loading && <p role="status">Loading your profile...</p>}
                {loadError && <p className="customer-profile-error" role="alert">{loadError}</p>}
                {!loading && !loadError && user && (
                    <div className="customer-profile-grid">
                        <section className="customer-profile-card" aria-labelledby="customer-personal-heading">
                            <h2 id="customer-personal-heading">Personal details</h2>
                            <form onSubmit={updatePersonalInformation}>
                                <fieldset disabled={savingDetails}>
                                    <div className="customer-profile-name-row">
                                        <div>
                                            <label htmlFor="customer-firstname">First name</label>
                                            <input id="customer-firstname" name="firstname" autoComplete="given-name"
                                                placeholder="First name" required
                                                value={details.firstname} onChange={changeDetail} />
                                        </div>
                                        <div>
                                            <label htmlFor="customer-lastname">Last name</label>
                                            <input id="customer-lastname" name="lastname" autoComplete="family-name"
                                                placeholder="Last name" required
                                                value={details.lastname} onChange={changeDetail} />
                                        </div>
                                    </div>
                                    <label htmlFor="customer-email">Email</label>
                                    <input id="customer-email" name="email" type="email" autoComplete="email"
                                        placeholder="Email" required
                                        readOnly
                                        value={details.email} onChange={changeDetail} />
                                    <label htmlFor="customer-phone">Phone</label>
                                    <input id="customer-phone" name="phonenum" type="tel" autoComplete="tel"
                                        placeholder="Phone" required pattern={String.raw`\+?[0-9]+`}
                                        title="Use digits, with an optional + at the start."
                                        value={details.phonenum} onChange={changeDetail} />
                                    <div className="customer-profile-actions">
                                        <button type="submit">{savingDetails ? "Saving..." : "Save changes"}</button>
                                        <button type="button" className="customer-profile-cancel" onClick={cancelChanges}>Cancel</button>
                                    </div>
                                </fieldset>
                            </form>
                        </section>

                        <section className="customer-profile-card" aria-labelledby="customer-password-heading">
                            <h2 id="customer-password-heading">Change password</h2>
                            <form onSubmit={updatePassword}>
                                <fieldset disabled={savingPassword}>
                                    <label htmlFor="customer-current-password">Current password</label>
                                    <input id="customer-current-password" name="current_password" type="password"
                                        autoComplete="current-password" placeholder="Current password" required
                                        value={passwords.current_password} onChange={changePassword} />
                                    <label htmlFor="customer-new-password">New password</label>
                                    <input id="customer-new-password" name="new_password" type="password"
                                        autoComplete="new-password" placeholder="New password" required
                                        value={passwords.new_password} onChange={changePassword} />
                                    <label htmlFor="customer-confirm-password">Confirm password</label>
                                    <input id="customer-confirm-password" name="confirm_password" type="password"
                                        autoComplete="new-password" placeholder="Confirm password" required
                                        value={passwords.confirm_password} onChange={changePassword} />
                                    <div className="customer-profile-actions">
                                        <button type="submit">Update password</button>
                                    </div>
                                </fieldset>
                            </form>
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
}

export default CustomerProfile;
