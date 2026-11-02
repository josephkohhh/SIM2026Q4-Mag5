import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import logo from "./Image/logo.png";
import introvideo from "./Image/login_video.mp4";

function Login({ setisloggedin, setCurrentUser, setCurrentRole }) {
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  async function login() {
    if (!email.trim() || !password.trim()) {
      alert("Email and password cannot be empty");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      const userId = data.user_id;
      const firstname = data.name;
      const lastname = data.surname;
      const userRole = data.role;

      const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();

      localStorage.setItem("currentUserId", String(userId));
      localStorage.setItem("currentRole", userRole);
      localStorage.setItem("currentUser", fullName);

      setCurrentUser(fullName);
      setCurrentRole(userRole);
      setisloggedin(true);

      const normalizedRole = userRole.replace(/\s+/g, "").toUpperCase();

      const destinations = {
        ADMIN: "/admin_portal",
        CUSTOMER: "/",
        INTERIORDESIGNER: "/designer_portal",
        PLATFORMMANAGEMENT: "/management_portal",
      };

      navigate(destinations[normalizedRole] || "/", { replace: true });

      // Reset form
      setEmail("");
      setpassword("");
      setRole("-");
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the server");
    }
  }

  // useEffect(() => {
  //   async function loadProfiles() {
  //     try {
  //       const response = await fetch(
  //         "http://localhost:8000/get_all_user_profile",
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to load profiles");
  //       }

  //       const data = await response.json();
  //       setProfiles(data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }

  //   loadProfiles();
  // }, []);

  return (
    <div className="login_page">
      <section className="login_intro">
        <video
          className="login_bg_video"
          src={introvideo}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />

        <div className="login_intro_content">
          <div className="login_logo">
            <img src={logo} />
          </div>

          <h2>
            Find the right interior designer
            <br />
            for your renovation.
          </h2>
        </div>
      </section>

      <section className="login_panel">
        <div className="login_form">
          <h1>Log in</h1>

          <label htmlFor="username">Email</label>
          <input
            id="username"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
          />

          <button onClick={login}>Log in</button>

          <Link to="/register">New customer? Create an account</Link>

          {["-", "Customer", "InteriorDesigner"].includes(role) && (
            <Link to="/register">New customer? Create an account</Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default Login;
