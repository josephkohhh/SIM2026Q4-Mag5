import { useState } from 'react';
import { Link } from 'react-router-dom';
import './login.css';
import logo from './Image/logo.png';
import introvideo from './Image/login_video.mp4';
import { useNavigate} from 'react-router-dom';

function Login({setisloggedin, setCurrentUser,setCurrentRole}){
    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [role, setRole] = useState("-");
    const navigate = useNavigate();

    async function login() {
      if (!username.trim() || !password.trim()){
        alert("Username and password cannot be empty");
        return;
      }
      else if(role === "-"){
          alert("Please select role");
          return;
      }
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: username,
          password: password,
          role: role,
        }),
    });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("currentUser", username);
        localStorage.setItem("currentRole", data.role);
        setCurrentUser(username);
        setCurrentRole(data.role);
        setisloggedin(true);
        const destinations = {
            UserAdmin: "/admin_portal",
            Customer: "/",
            InteriorDesigner: "/designer_portal",
            PlatformManagement: "/management_portal",
          };

          navigate(destinations[data.role] || "/", { replace: true });
      } 
      else {
        alert(data.message);
      }
      setusername("");
      setpassword("");
      setRole("-");
    }

  return(
    <div className="login_page">
        <section className="login_intro">
            <video className='login_bg_video' src={introvideo} autoPlay muted loop playsInline aria-hidden='true'/>
            <div className="login_intro_content">
                <div className="login_logo"><img src={logo}/></div>
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
            <label htmlFor="username">Username</label>
            <input id="username" placeholder="Enter username" value={username} onChange={(e) => setusername(e.target.value)}/>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Enter password" value={password} onChange={(e) => setpassword(e.target.value)} />
            <label htmlFor="roles">Role</label>
            <select id="roles" value={role} onChange={(e) => setRole(e.target.value)} >
                <option value="-">Select role</option>
                <option value="UserAdmin">User Admin</option>
                <option value="Customer">Customer</option>
                <option value="InteriorDesigner">Interior Designer</option>
                <option value="PlatformManagement">Platform Management</option>
            </select>
            <button onClick={login}>Log in</button>

            {["Customer", "InteriorDesigner", "PlatformManagement"].includes(role) && (
              <Link to="/forgot-password">Forgot password?</Link>
            )}
            {["-","Customer", "InteriorDesigner"].includes(role) && (
              <Link to="/register">New customer? Create an account</Link>
            )}
        </div>
        </section>
    </div>
    );
}

export default Login;