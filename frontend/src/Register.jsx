import UserForm from "./Component/UserForm";
import logo from "./Image/logo.png";
import "./register.css";
import { Link, useNavigate } from "react-router-dom";

function Register({ setisloggedin, setCurrentUser, setCurrentRole }) {
  const navigate = useNavigate();
  async function register(userdata) {
    const response = await fetch("http://localhost:8000/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userdata),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Login failed");
      //   setnewusername("");
      //   setnewpassword("");
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
      CUSTOMER: "/",
      INTERIOR_DESIGNER: "/designer_portal",
    };

    navigate(destinations[normalizedRole] || "/", { replace: true });
  }

  return (
    <div className="register_page">
      <section className="register_intro">
        <div className="register_intro_content">
          <div className="register_logo">
            <img src={logo} alt="Logo" />
          </div>
          <h2>
            Start your renovation journey
            <br />
            with the right people.
          </h2>
          <p>
            Create your account to connect with interior designers and manage
            your project.
          </p>
        </div>
      </section>

      <section className="register_panel">
        <div className="register_form">
          <h1>Register an account</h1>
          <p className="register_subtitle">
            Fill in your details to get started.
          </p>
          <UserForm
            buttonText="Register"
            onSubmit={register}
            isRegister={true}
          />
          <p className="register_login_link">
            {" "}
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;
