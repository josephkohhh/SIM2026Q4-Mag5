import { NavLink, useLocation,} from "react-router-dom";

function Navbar({ isloggedin, currentUser, logout }) {
    const location = useLocation();
    const hideNavbar = location.pathname.startsWith("/admin_portal/");
    const Admin_portal = location.pathname === "/admin_portal";

    if (hideNavbar) {
        return(<nav className="UA_navbar">
        <div className="UA_nav-links">
            {(location.pathname === "/admin_portal/createuser" || location.pathname === "/admin_portal/edituser" || location.pathname === "/admin_portal/viewuser") && (
                <NavLink className="Back" to="/admin_portal" end>Back</NavLink>
            )}
            {isloggedin ? (
            <div>
                <span>👤 {currentUser}</span>
                <button onClick={logout}>Logout</button>
            </div>
            ) : (
            <NavLink to="/login">Login</NavLink>
            )}
        </div>
        </nav>)
    }
    if (Admin_portal){
        return (null);
    }

    return (
        <nav className="navbar">
        <div className="nav-links">
            <NavLink to="/" end>Main</NavLink>
            <NavLink to="/favourite">Favourite</NavLink>
            <NavLink to="/project">Project</NavLink>

            {isloggedin ? (
            <div>
                <span>👤 {currentUser}</span>
                <button onClick={logout}>Logout</button>
            </div>
            ) : (
            <NavLink to="/login">Login</NavLink>
            )}
        </div>
        </nav>
    );
    }

    export default Navbar;