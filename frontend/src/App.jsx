import { useEffect, useState } from 'react';
import {BrowserRouter, NavLink, Routes, Route} from 'react-router-dom'
import Favourite from './Favourite'
import Project from './Project';
import Navbar from './Component/Navbar';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import Register from './Register';
import AdminPortal from './AdminPortal';
import CreateUser from './CreateUser';
import Home from './Home';
import EditUser from './EditUser';
import Viewuser from './Viewuser';
import './App.css';

function App() {
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem("currentRole") || "");
  const [isloggedin, setisloggedin] = useState(() => Boolean(localStorage.getItem("currentUser")));
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("currentUser") || "");

  function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");
    setisloggedin(false);
    setCurrentUser("");
    setCurrentRole("");
  }

  return (
    <BrowserRouter>
      <Navbar isloggedin={isloggedin} currentUser={currentUser} logout={logout}/>
      <Routes>
        <Route path="/" element={<Home isloggedin={isloggedin} currentUser={currentUser}/>}/>

        <Route path="/login" element={<Login
          setisloggedin={setisloggedin}
          setCurrentUser={setCurrentUser}
          setCurrentRole={setCurrentRole}/>}/>

        <Route path="/register" element={<Register  
          setisloggedin={setisloggedin}
          setCurrentUser={setCurrentUser}
          setCurrentRole={setCurrentRole} />}/>

        {/* Customer Route */}
        <Route
          path="/favourite"
          element={
            <ProtectedRoute isloggedin={isloggedin} currentRole={currentRole} allowedRoles={["Customer"]}>
              <Favourite currentUser={currentUser} />
            </ProtectedRoute>
        }/>
        <Route
          path="/project"
          element={
            <ProtectedRoute isloggedin={isloggedin} currentRole={currentRole} allowedRoles={["Customer"]}>
              <Project currentUser={currentUser} />
            </ProtectedRoute>
        }/>
        

        {/* UserAdmin Route */}
        <Route
          path="/admin_portal"
          element={
            <ProtectedRoute isloggedin={isloggedin} currentRole={currentRole} allowedRoles={["UserAdmin"]}>
              <AdminPortal logout={logout}/>
            </ProtectedRoute>
          }/>
          <Route
          path="/admin_portal/createuser"
          element={
            <ProtectedRoute isloggedin={isloggedin} currentRole={currentRole} allowedRoles={["UserAdmin"]}>
              <CreateUser />
            </ProtectedRoute>
          }/>
          <Route
          path="/admin_portal/edituser"
          element={
            <ProtectedRoute isloggedin={isloggedin} currentRole={currentRole} allowedRoles={["UserAdmin"]}>
              <EditUser />
            </ProtectedRoute>
          }/>
          
          <Route
          path="/admin_portal/viewuser"
          element={
            <ProtectedRoute isloggedin={isloggedin} currentRole={currentRole} allowedRoles={["UserAdmin"]}>
              <Viewuser logout={logout}/>
            </ProtectedRoute>
          }/>

        {/* InteriorDesigner Route */}
        <Route>

        </Route>

        {/* PlatformManagement Route */}
        <Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;