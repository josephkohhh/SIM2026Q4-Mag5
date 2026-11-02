import { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import './login.css';
import logo from './Image/logo.png';
import introvideo from './Image/login_video.mp4';
import { useNavigate} from 'react-router-dom';

function Login({setisloggedin, setCurrentUser,setCurrentRole}){
    const [email, setEmail] = useState("");
    const [password, setpassword] = useState("");
    const [role, setRole] = useState("-");
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);

    async function login() {
      if (!email.trim() || !password.trim()){
        alert("email and password cannot be empty");
        return;
      }
      else if(role === "-"){
          alert("Please select role");
          return;
      }
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email,
          password: password,
          role: role,
        }),
    });

      const data = await response.json();
      if (data.success) {
        {/* Need to change token*/}
        const fullName = `${data.firstname ?? ""} ${data.lastname ?? ""}`.trim();
        localStorage.setItem("currentEmail", email);
        localStorage.setItem("currentUserId", String(data.user_id));
        localStorage.setItem("currentRole", data.role);
        localStorage.setItem("currentUser", fullName);
        setCurrentUser(fullName);
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
      setEmail("");
      setpassword("");
      setRole("-");
    }

    useEffect(() => {
        async function loadProfiles() {
          try{
              const response = await fetch("http://127.0.0.1:8000/user-profiles");
              if (!response.ok) {throw new Error("Failed to load profiles");}
                const data = await response.json();
                setProfiles(data);
                } catch (error) {
                    console.error(error);
                }
            }
            loadProfiles();
        }, []);

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
            <label htmlFor="username">Email</label>
            <input id="username" type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Enter password" value={password} onChange={(e) => setpassword(e.target.value)} />
            <label htmlFor="roles">Role</label>
            <select id="roles" value={role} onChange={(e) => setRole(e.target.value)} >
                <option value="-">Select role</option>
                {profiles.map((profile) => (
                  <option key={profile.id}value={profile.name.replace(/\s+/g, "")}>{profile.name}</option>
                ))}
            </select>
            <button onClick={login}>Log in</button>
            
            {["-","Customer", "InteriorDesigner"].includes(role) && (
              <Link to="/register">New customer? Create an account</Link>
            )}
        </div>
        </section>
    </div>
    );
}

export default Login;
