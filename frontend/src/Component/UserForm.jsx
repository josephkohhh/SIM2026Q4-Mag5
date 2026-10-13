import { useState, useEffect } from "react";

function UserForm({buttonText, onSubmit, isAdmin = false, initialData ={}, isEdit=false, isRegister=false, isView=false}){
    const [firstname, setFirstname] = useState(initialData.firstname ?? "");
    const [lastname, setLastname] = useState(initialData.lastname ?? "");
    const [username, setUsername] = useState(initialData.username ?? "");
    const [password, setPassword] = useState("");
    const [phonenum, setphonenum] = useState(initialData.phonenum ?? "");
    const [status, setstatus] = useState(initialData.status ?? "active");
    const [email, setEmail] = useState(initialData.email ?? "");
    const [confirmpassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState(initialData.role ?? "-");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [profiles, setProfiles] = useState([]);

    function handleSubmit(e){
        e.preventDefault();

        if (isView){
          return;
        }

        if (!username.trim() || !email.trim()){
          alert("Username and password cannot be empty");
          return;
        }

        if (!isEdit && !password.trim()){
          alert("Password cannot be empty");
          return;
        }

        if(password !== confirmpassword){
            alert("Password do not match");
            return;
        }

        if (!isEdit && !agreeTerms) {
          alert("Please agree to the Terms and Conditions");
          return;
        }

        const formatData ={
            firstname,
            lastname,
            username,
            email,
            phonenum,
            status,
        }
        if (!isEdit){
          formatData.role = role;
        }

        if (password) {
        formatData.password = password;
        }

        onSubmit(formatData);
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

  return (
    <form className="user_form" onSubmit={handleSubmit}>
      <div className="name_row">
        <div className="name_field">
          <label htmlFor="register_firstname">First Name</label>
          <input
            id="register_firstname"
            type="text"
            placeholder="First name"
            required
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            readOnly={isView}
          />
        </div>

        <div className="name_field">
          <label htmlFor="register_lastname">Last Name</label>
          <input
            id="register_lastname"
            type="text"
            placeholder="Last name"
            required
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            readOnly={isView}
          />
        </div>
      </div>
      <label htmlFor="register_username">Username</label>
      <input
        id="register_username"
        placeholder="Enter username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        readOnly={isView}
      />

      <label htmlFor="register_email">Email</label>
      <input
        id="register_email"
        type="email"
        placeholder="Enter email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        readOnly={isView}
      />
      <label htmlFor="register_phone">Phone</label>
      <input
        id="phone"
        type="tel"
        pattern={String.raw`\+?[0-9]+`}
        placeholder="Enter Phone Number"
        required
        value={phonenum}
        onChange={(e) => {
          const value = e.target.value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
          setphonenum(value);
        }}
        readOnly={isView}/>
      {!isView && (
        <>
          <label htmlFor="register_password">Password</label>
          <input
            id="register_password"
            type="password"
            placeholder="Enter password"
            required={!isEdit}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="register_confirm">Confirm Password</label>
          <input
            id="register_confirm"
            type="password"
            placeholder="Confirm password"
            required={!isEdit}
            value={confirmpassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </>
      )}

      <label htmlFor="register_role">Role</label>
      <select id="register_role" value={role} onChange={(e) => setRole(e.target.value)} disabled={isEdit || isView}>
        <option value="-">Select role</option>
      {profiles
        .filter(profile => isEdit || isView || (!profile.suspended &&( isAdmin || ["Customer", "Interior Designer"].includes(profile.name) )))
        .map(profile => ( <option key={profile.id} value={profile.name.replace(/\s+/g, "")}> {profile.name} </option>))}
      </select>
      {(isEdit || isView) && (
          <>
              <label htmlFor="register_status">Status</label>
              <select
                  id="register_status" value={status} onChange={(e) => setstatus(e.target.value)} disabled={isView}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
              </select>
          </>
      )}
      {isRegister && !isView && (
        <div className="terms_container">
            <label className="terms_label">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} required />
                  <span> I agree to the{" "} <a target="_blank" rel="noopener noreferrer"> Terms and Conditions </a> {" "}and{" "} <a target="_blank" rel="noopener noreferrer"> Privacy Policy </a>
                  </span>
              </label>
          </div>
      )}
      {!isView && (
        <button type="submit">{buttonText}</button>
      )}
      

    </form>
  );
}

export default UserForm;