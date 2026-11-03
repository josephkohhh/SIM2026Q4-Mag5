import UserForm from "./Component/UserForm";
import logo from "./Image/logo.png";
import "./register.css";
import { Link, useNavigate } from "react-router-dom";

function Register({ setisloggedin, setCurrentUser, setCurrentRole }) {
  const navigate = useNavigate();
async function register(userdata) {
  let registered = false;

  const requestOptions = {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };

  try {
    const response = await fetch("http://localhost:8000/register", {
      ...requestOptions,
      body: JSON.stringify(userdata),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        typeof result?.detail === "string"
          ? result.detail
          : "Registration failed.");}

    registered = true;
    const loginResponse = await fetch("http://localhost:8000/login", {
      ...requestOptions,
      body: JSON.stringify({
        email: userdata.email,
        password: userdata.password,
      }),
    });

    const data = await loginResponse.json().catch(() => null);

    if (
      !loginResponse.ok ||
      !Number.isInteger(data?.user_id) ||
      typeof data?.role !== "string"
    ) {
      throw new Error("Automatic login failed.");
    }

    const fullName = `${data.name ?? ""} ${data.surname ?? ""}`.trim();
    const userRole = data.role.replace(/\s+/g, "").toUpperCase();

    localStorage.setItem("currentUserId", String(data.user_id));
    localStorage.setItem("currentRole", userRole);
    localStorage.setItem("currentUser", fullName);
    localStorage.setItem("currentEmail", userdata.email.trim());

    setCurrentUser(fullName);
    setCurrentRole(userRole);
    setisloggedin(true);

    const destinations = {
      CUSTOMER: "/",
      INTERIOR_DESIGNER: "/designer_portal",
    };

    navigate(destinations[userRole] || "/", { replace: true });
  } catch (error) {
    alert(
      registered
        ? "Registration succeeded, but automatic login failed. Please log in."
        : error.message
    );

    if (registered) {
      navigate("/login", { replace: true });
    }
  }
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
