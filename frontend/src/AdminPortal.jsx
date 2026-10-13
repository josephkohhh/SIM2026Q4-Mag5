import { Link } from "react-router-dom";
import "./adminportal.css";
import logo from './Image/logo.png'
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

function AdminPortal({logout}) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const [search, setSearch] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [changingStatus, setChangingStatus] = useState(false);
    
    useEffect(() => {
    const controller = new AbortController();

    async function getUsers() {
        try {
            const response = await fetch("http://localhost:8000/users", {
            signal: controller.signal,
            });

            if (!response.ok) {
            throw new Error(`ErrorCode: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
            throw new Error("Data return are not array");
            }

            setUsers(data);
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

        getUsers();
        return () => controller.abort();
    }, []);

    {/* Control number of user show in list */}
    const filteredUsers = users.filter((user) => {
        const keyword = search.trim().toLowerCase();
        const username = String(user.username ?? "").toLowerCase();
        const email = String(user.email ?? "").toLowerCase();
        const status = String(user.status ?? "").toLowerCase();

        const matchesSearch = username.includes(keyword) || email.includes(keyword);
        const matchesRole = selectedRole === "" || user.role === selectedRole;
        const matchesStatus = selectedStatus === "" || status === selectedStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

    async function ChangeStatus(user){
        if (changingStatus) return;
        const currentStatus = String(user.status ?? "active").toLowerCase();
        const newStatus = currentStatus === "suspended" ? "active" : "suspended";
        setChangingStatus(true);

        const response = await fetch("http://127.0.0.1:8000/ChangeStatus", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({
            username: user.username,
            status: newStatus,
            }),
        });

        const data = await response.json();
            if (data.success) {
                alert("Update status successful")
            } else {
                alert("Unable to update the account status. Please try again. If the problem persists, contact technical support.");
            }
        setUsers((previousUsers) => previousUsers.map((item) =>
            item.username === user.username ? {...item,status:newStatus} :item));
        setChangingStatus(false);
        setSearch("");
        setSelectedRole("");
        setSelectedStatus("");
        }

    return (
        <div className="AdminPortal_page">
        <aside className="AdminPortal_navbar">
            <img src={logo} alt="LOGO"></img>

            <nav className="AdminPortal_menu">
                <Link to="/admin_portal" className="active">Users Account</Link>
                <Link to="/admin_portal/user_profiles">User Profiles</Link>
            </nav>

            <button type="button" className="signout" onClick={logout}>Sign out</button>
        </aside>

        <main className="AdminPortal_content">
            <header className="AdminPortal_header">
            <h1>User Admin Dashboard</h1>
            </header>

            <div className="AdminPortal_columns">
            <section className="AdminPortal_users">
                <div className="AdminPortal_filters">
                    <input
                        placeholder="Search name or email"
                        value={search}
                        onChange={(event) => {
                        setSearch(event.target.value);
                        setCurrentPage(1);
                        }}
                    />

                    <select
                        aria-label="Filter_by_role"
                        value={selectedRole}
                        onChange={(event) => {
                        setSelectedRole(event.target.value);
                        setCurrentPage(1);
                        }}
                    >
                        <option value="">Role: All</option>
                        <option value="UserAdmin">User Admin</option>
                        <option value="Customer">Customer</option>
                        <option value="InteriorDesigner">Interior Designer</option>
                        <option value="PlatformManagement">Platform Management</option>
                    </select>
                    <select
                        aria-label="Filter_by_status"
                        value={selectedStatus}
                        onChange={(event) => {
                        setSelectedStatus(event.target.value);
                        setCurrentPage(1);
                        }}
                    >
                        <option value="">Status: All</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>

                <div className="AdminPortal_table">
                <table>
                    <colgroup>
                        <col style={{ width: "60px" }} />
                        <col />                      
                        <col style={{ width: "28%" }} /> 
                        <col style={{ width: "130px" }} />
                        <col style={{ width: "244px" }} /> 
                    </colgroup>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (<tr><td colSpan={4}>Loading...</td></tr>
                    ) : error ? (<tr><td colSpan={4}>{error}</td></tr>
                    ) : filteredUsers.length === 0 ? (<tr><td colSpan={5}>No users found</td></tr>
                    ) : (currentUsers.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.role}</td>
                            <td>{user.status ?? "Active"}</td>
                            <td>
                                <div className="AdminPortal_actions">
                                    <Link to="/admin_portal/viewuser" state={{ user }} className="action_view"><Eye size={18} /></Link>
                                    <div className="AdminPortal_actionGroup">
                                        <Link to="/admin_portal/edituser" state={{user}} className="action_edit"> Edit</Link>
                                        <button className={ String(user.status ?? "active").toLowerCase() === "suspended" ? "action_activate" : "action_suspend"} type="button" disabled={changingStatus} onClick={() => (ChangeStatus(user))}> {String(user.status ?? "active").toLowerCase() === "suspended" ? "Activate" : "Suspend"}</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                {!loading && !error && filteredUsers.length > 0 && (
                    <div className="AdminPortal_pagination">
                        <button type="button"disabled={currentPage === 1}onClick={() => setCurrentPage((page) => page - 1)}>Previous</button>
                        <span>Page {currentPage} of {totalPages} </span>
                        <button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => page + 1)}> Next </button>
                    </div>
                )}
                </div>
            </section>

            <section className="AdminPortal_profile">
                <Link to="/admin_portal/createuser" className="createuser_btn"> + Create account</Link>
            </section>
            </div>
        </main>
        </div>
    );
}

export default AdminPortal;