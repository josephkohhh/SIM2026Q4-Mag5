import { NavLink, useLocation,} from "react-router-dom";

function Navbar({ isloggedin, currentUser, currentRole, logout }) {
    const location = useLocation();
    const pathname = location.pathname;

    const isDesignerProfilePage = [
    "/designer_portal/company_profile",
    "/designer_portal/my_profile",
    ].includes(pathname);

    const isDesignerArea =
    pathname === "/designer_portal" ||
    pathname.startsWith("/designer_portal/");

    if (isDesignerArea && !isDesignerProfilePage) {
    return null;
    }

    const hideNavbar =
    pathname.startsWith("/admin_portal/") ||
    isDesignerProfilePage;

    const backTo = isDesignerProfilePage
    ? "/designer_portal"
    : "/admin_portal";

    const showBack =
    isDesignerProfilePage ||
    [
        "/admin_portal/createuser",
        "/admin_portal/edituser",
        "/admin_portal/viewuser",
    ].includes(pathname);

    const Admin_portal = pathname === "/admin_portal";
    const PM_portal = pathname === "/management_portal";
    const PM_report = pathname === "/management_portal/report";

    if (hideNavbar) {
        return(<nav className="UA_navbar">
        <div className="UA_nav-links">
            {showBack && (
            <NavLink className="Back" to={backTo} end>
                Back
            </NavLink>
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

    if(PM_portal){
        return (null);
    }
    if (PM_report) {
        return null;
}

    return (
        <nav className="navbar">
        <div className="nav-links">
            <NavLink to="/" end>Main</NavLink>
            <NavLink to="/favourite">Favourite</NavLink>
            <NavLink to="/project">Project</NavLink>

            {isloggedin ? (
            <div>
                {currentRole === "CUSTOMER" ? (
                    <NavLink to="/customer_profile" aria-label={`My profile: ${currentUser}`}>👤 {currentUser}</NavLink>
                ) : (
                    <span>👤 {currentUser}</span>
                )}
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
