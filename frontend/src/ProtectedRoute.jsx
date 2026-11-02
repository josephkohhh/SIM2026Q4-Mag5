import { Navigate } from 'react-router-dom';

function ProtectedRoute({
  isloggedin,
  currentRole,
  allowedRoles,
  children
}) {
  if (!isloggedin) {
    return<Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    const destinations = {
      Customer: "/",
      InteriorDesigner: "/designer_portal",
      UserAdmin: "/admin_portal",
      PlatformManagement: "/management_portal",
    };
    return <Navigate to={destinations[currentRole] || "/"} replace />;
  }

  return children;
}

export default ProtectedRoute;
