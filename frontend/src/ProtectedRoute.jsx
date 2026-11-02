import { Navigate } from "react-router-dom";

function ProtectedRoute({ isloggedin, currentRole, allowedRoles, children }) {
  if (!isloggedin) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    const destinations = {
      CUSTOMER: "/",
      INTERIOR_DESIGNER: "/designer_portal",
      ADMIN: "/admin_portal",
      PLATFORM_MANAGEMENT: "/management_portal",
    };
    return <Navigate to={destinations[currentRole] || "/"} replace />;
  }

  return children;
}

export default ProtectedRoute;
