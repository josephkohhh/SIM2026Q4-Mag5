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
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;