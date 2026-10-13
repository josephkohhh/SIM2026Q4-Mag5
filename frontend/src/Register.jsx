import UserForm from "./Component/UserForm";
import logo from './Image/logo.png';
import "./register.css";
import { Link, useNavigate } from "react-router-dom";

function Register({setisloggedin, setCurrentUser,setCurrentRole}){
    const navigate = useNavigate();
    async function register(userdata){
        const response = await fetch("http://127.0.0.1:8000/register", {
            method: "POST",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(userdata),
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("currentUser", userdata.username);
            localStorage.setItem("currentRole", userdata.role);
            setCurrentUser(userdata.username);
            setCurrentRole(userdata.role);
            setisloggedin(true);
            const destinations = {
                Customer: "/",
                InteriorDesigner: "/designer_portal",};

                navigate(destinations[userdata.role] || "/", { replace: true });
        } else {
            alert(data.message);
            setnewusername("");
            setnewpassword("");
            }
    }

    return (
        <div className="register_page">
            <section className="register_intro">
                <div className="register_intro_content">
                <div className="register_logo">
                    <img src={logo} alt="Logo" />
                </div>
                <h2>Start your renovation journey<br />with the right people.</h2>
                <p>Create your account to connect with interior designers and manage your project.</p>
                </div>
            </section>

            <section className="register_panel">
                <div className="register_form">
                <h1>Create an account</h1>
                <p className="register_subtitle">Fill in your details to get started.</p>
                <UserForm buttonText="Register" onSubmit={register} isRegister={true}/>
                <p className="register_login_link"> Already have an account?{" "}<Link to="/login">Log in</Link></p>
                </div>
            </section>
        </div>
    );
}

export default Register;