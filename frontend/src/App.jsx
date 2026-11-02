import { useEffect, useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import ScrollTop from "./Component/ScrollTop";
import Favourite from "./Favourite";
import Project from "./Project";
import Navbar from "./Component/Navbar";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";
import AdminPortal from "./AdminPortal";
import CreateUser from "./CreateUser";
import Home from "./Home";
import EditUser from "./EditUser";
import Viewuser from "./Viewuser";
import "./App.css";
import UserProfiles from "./UserProfiles";
import PlatformManagementportal from "./PlatformManagementportal";
import Report from "./Reports";
import ProjectDetails from "./Component/ProjectDetails";
import CompanyProfile from "./CompanyProfile";
import CustomerProfile from "./CustomerProfile";
import DesignerPortal from "./DesignerPortal";
import DesignerProfile from "./DesignerProfile";
import MyIDPs from "./MyIDPs";

function App() {
  const [currentRole, setCurrentRole] = useState(
    () => localStorage.getItem("currentRole") || "",
  );
  const [isloggedin, setisloggedin] = useState(() =>
    Boolean(localStorage.getItem("currentUser")),
  );
  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem("currentUser") || "",
  );
  const isDesigner = isloggedin && currentRole === "InteriorDesigner";

  function logout() {
    fetch("http://localhost:8000/logout", {
      method: "POST",
      credentials: "include",
    }).catch((error) =>
      console.error("Unable to end the login session", error),
    );
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentEmail");
    setisloggedin(false);
    setCurrentUser("");
    setCurrentRole("");
  }

  function updateCurrentUser(user) {
    const fullName = `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();
    localStorage.setItem("currentUser", fullName);
    localStorage.setItem("currentEmail", user.email);
    localStorage.setItem("currentRole", user.role);
    setCurrentUser(fullName);
    setCurrentRole(user.role);
  }

  return (
    <BrowserRouter>
      <ScrollTop />
      <Navbar
        isloggedin={isloggedin}
        currentUser={currentUser}
        currentRole={currentRole}
        logout={logout}
      />
      <Routes>
        <Route
          path="/"
          element={
            isDesigner ? (
              <Navigate to="/designer_portal" replace />
            ) : (
              <Home isloggedin={isloggedin} currentUser={currentUser} />
            )
          }
        />

        <Route
          path="/login"
          element={
            isDesigner ? (
              <Navigate to="/designer_portal" replace />
            ) : (
              <Login
                setisloggedin={setisloggedin}
                setCurrentUser={setCurrentUser}
                setCurrentRole={setCurrentRole}
              />
            )
          }
        />

        <Route
          path="/register"
          element={
            isDesigner ? (
              <Navigate to="/designer_portal" replace />
            ) : (
              <Register
                setisloggedin={setisloggedin}
                setCurrentUser={setCurrentUser}
                setCurrentRole={setCurrentRole}
              />
            )
          }
        />

        {/* Customer Route */}
        <Route
          path="/favourite"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["Customer"]}
            >
              <Favourite currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["Customer"]}
            >
              <Project currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["Customer"]}
            >
              <ProjectDetails currentUser={currentUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer_profile"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["Customer"]}
            >
              <CustomerProfile onProfileUpdated={updateCurrentUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId/company-profile"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["Customer"]}
            >
              <CompanyProfile readOnly={true} />
            </ProtectedRoute>
          }
        />

        {/* UserAdmin Route */}
        <Route
          path="/admin_portal"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["ADMIN"]}
            >
              <AdminPortal logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin_portal/createuser"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["ADMIN"]}
            >
              <CreateUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin_portal/edituser"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["ADMIN"]}
            >
              <EditUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin_portal/viewuser"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["ADMIN"]}
            >
              <Viewuser logout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin_portal/user_profiles"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["ADMIN"]}
            >
              <UserProfiles logout={logout} />
            </ProtectedRoute>
          }
        />

        {/* InteriorDesigner Route */}
        <Route
          path="/designer_portal"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["InteriorDesigner"]}
            >
              <DesignerPortal logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/designer_portal/company_profile"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["INTERIOR_DESIGNER"]}
            >
              <CompanyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/designer_portal/my_profile"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["INTERIOR_DESIGNER"]}
            >
              <DesignerProfile onProfileUpdated={updateCurrentUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/designer_portal/my_idps"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["INTERIOR_DESIGNER"]}
            >
              <MyIDPs logout={logout} />
            </ProtectedRoute>
          }
        />

        {/* PlatformManagement Route */}
        <Route>
          <Route
            path="/management_portal"
            element={
              <ProtectedRoute
                isloggedin={isloggedin}
                currentRole={currentRole}
                allowedRoles={["PLATFORM_MANAGEMENT"]}
              >
                <PlatformManagementportal logout={logout} />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* PlatformManagement report Route*/}
        <Route
          path="/management_portal/report"
          element={
            <ProtectedRoute
              isloggedin={isloggedin}
              currentRole={currentRole}
              allowedRoles={["PLATFORM_MANAGEMENT"]}
            >
              <Report logout={logout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
