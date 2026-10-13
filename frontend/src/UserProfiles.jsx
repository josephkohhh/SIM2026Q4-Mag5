
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./UserProfiles.css";
import "./adminportal.css";
import logo from "./Image/logo.png";

const API = "http://127.0.0.1:8000/user-profiles";

export default function UserProfiles({ logout }) {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Load profile types from FastAPI.
  async function loadProfiles() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Unable to load profiles");
      setProfiles(await response.json());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  function addProfile() {
    setEditId(null);
    setName("");
    setDescription("");
    setShowForm(true);
  }

  function editProfile(profile) {
    setEditId(profile.id);
    setName(profile.name);
    setDescription(profile.description);
    setShowForm(true);
  }

  async function saveProfile(event) {
    event.preventDefault();

    const existing = profiles.find(
      (profile) => profile.id === editId
    );

    const data = {
      name: name.trim(),
      description: description.trim(),
      suspended: existing ? existing.suspended : false,
    };

    try {
      const response = await fetch(
        editId === null ? API : `${API}/${editId}`,
        {
          method: editId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save profile");
      }

      setShowForm(false);
      await loadProfiles();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleSuspend(profile) {
    const action = profile.suspended ? "activate" : "suspend";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${profile.name}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API}/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          description: profile.description,
          suspended: !profile.suspended,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update status");
      }

      await loadProfiles();
    } catch (err) {
      setError(err.message);
    }
  }


  // Delete Profile
  async function deleteProfile(profile) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${profile.name}?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API}/${profile.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete profile");
      }

      alert("Profile deleted successfully");
      await loadProfiles();

    } catch (err) {
      setError(err.message);
    }
  }

  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="AdminPortal_page">

      {/* SIDEBAR */}
      <aside className="AdminPortal_navbar">

        <img src={logo} alt="LOGO" />

        <nav className="AdminPortal_menu">

          <Link to="/admin_portal">
            Users
          </Link>

          <Link
            to="/admin_portal/user_profiles"
            className="active"
          >
            User Profiles
          </Link>

        </nav>

        <button
          type="button"
          className="signout"
          onClick={logout}
        >
          Sign out
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="AdminPortal_content">

        <div className="user-profiles-page">

          <h2>User Profiles</h2>

          <div className="user-profiles-panel">

            <h3>All User Profiles</h3>

            <input
              className="profile-search"
              type="text"
              placeholder="Search user profile name"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <button
              className="profile-add"
              onClick={addProfile}
            >
              + Add User Profile
            </button>

            {showForm && (
              <form
                className="profile-form"
                onSubmit={saveProfile}
              >

                <h3>
                  {editId === null
                    ? "Add User Profile"
                    : "Edit User Profile"}
                </h3>

                <label>Profile Name</label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />

                <label>Description</label>

                <input
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  required
                />

                <div className="profile-form-actions">

                  <button type="submit">
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                </div>

              </form>
            )}

            {error && (
              <p className="profile-error">
                {error}
              </p>
            )}

            <div className="profile-table-scroll">

              <table className="profile-table">

                <thead>
                  <tr>
                    <th>Profile Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredProfiles.map((profile) => (

                    <tr key={profile.id}>

                      <td>{profile.name}</td>

                      <td>{profile.description}</td>

                      <td>
                        <span className={profile.suspended ? "status-suspended" : "status-active"}>
                          {profile.suspended ? "Suspended" : "Active"}
                        </span>

                        <button
                          type="button"
                          className={profile.suspended ? "profile-activate-btn" : "profile-suspend-btn"}
                          onClick={() => toggleSuspend(profile)}
                        >
                          {profile.suspended ? "Activate" : "Suspend"}
                        </button>
                      </td>


                      <td>
                        <button
                          className="profile-edit"
                          onClick={() =>
                            editProfile(profile)
                          }
                        >
                          Edit
                        </button>
                          <button
                          className="profile-delete"
                          onClick={() => deleteProfile(profile)}
                        >
                          Delete
                        </button>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {filteredProfiles.length === 0 && (
                <p className="profile-empty">
                  No matching profiles found.
                </p>
              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
