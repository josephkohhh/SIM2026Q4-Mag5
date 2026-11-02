import { useState, useEffect } from "react";

function UserForm({
  buttonText,
  onSubmit,
  isAdmin = false,
  initialData = {},
  isEdit = false,
  isRegister = false,
  isView = false,
  isSelfEdit = false,
}) {
  const [firstname, setFirstname] = useState(initialData.name ?? "");
  const [lastname, setLastname] = useState(initialData.surname ?? "");
  const [password, setPassword] = useState("");
  const [phonenum, setPhonenum] = useState(initialData.phone_no ?? "");
  const [status, setStatus] = useState(initialData.status ?? "ACTIVE");
  const [email, setEmail] = useState(initialData.email ?? "");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(initialData.role ?? "-");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [profiles, setProfiles] = useState([
    "ADMIN",
    "CUSTOMER",
    "INTERIOR DESIGNER",
    "PLATFORM MANAGEMENT",
  ]);
  const [current_password, setCurrent_password] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (isView) return;

    if (!email.trim()) {
      alert("Email cannot be empty");
      return;
    }

    if (!firstname.trim() || !lastname.trim()) {
      alert("First name and last name cannot be empty");
      return;
    }

    if (!isEdit && !password.trim()) {
      alert("Password cannot be empty");
      return;
    }

    if (password !== confirmpassword) {
      alert("Passwords do not match");
      return;
    }

    if (isRegister && role === "-") {
      alert("Please select a role");
      return;
    }

    if (isRegister && !agreeTerms) {
      alert("Please agree to the Terms and Conditions");
      return;
    }

    const formatData = {
      email: email.trim(),
      name: firstname.trim(),
      surname: lastname.trim(),
      phone_no: phonenum.trim(),
    };

    if (!isEdit) {
      formatData.role = role;
    }

    if (isEdit || isView) {
      formatData.status = status;
    }

    if (password) {
      formatData.password = password;

      if (isSelfEdit) {
        formatData.current_password = current_password;
      }
    }

    onSubmit(formatData);
  }

  useEffect(() => {
    async function loadProfiles() {
      try {
        const response = await fetch("http://localhost:8000/user-profiles");

        if (!response.ok) {
          throw new Error("Failed to load profiles");
        }

        const data = await response.json();
        setProfiles(data);
      } catch (error) {
        console.error("Error loading profiles:", error);
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
      {!isEdit && (
        <>
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
        </>
      )}

      <label htmlFor="register_phone">Phone</label>
      <input
        id="register_phone"
        type="tel"
        pattern={String.raw`\+?[0-9]+`}
        placeholder="Enter Phone Number"
        required
        value={phonenum}
        onChange={(e) => {
          const value = e.target.value
            .replace(/[^\d+]/g, "")
            .replace(/(?!^)\+/g, "");

          setPhonenum(value);
        }}
        readOnly={isView}
      />

      {!isView && (
        <>
          {isSelfEdit && (
            <>
              <label htmlFor="register_current_password">
                Current Password
              </label>
              <input
                id="register_current_password"
                type="password"
                autoComplete="current-password"
                placeholder="Required when changing your password"
                required={Boolean(password)}
                value={current_password}
                onChange={(e) => setCurrent_password(e.target.value)}
              />
            </>
          )}

          <label htmlFor="register_password">Password</label>
          <input
            id="register_password"
            type="password"
            placeholder={
              isSelfEdit
                ? "Leave blank to keep your current password"
                : "Enter password"
            }
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
      <select
        id="register_role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={isEdit || isView}
      >
        <option value="-">Select role</option>

        {profiles
          .filter(
            (profile) =>
              isEdit ||
              isView ||
              (isRegister
                ? !["ADMIN", "PLATFORM MANAGEMENT"].includes(profile)
                : isAdmin ||
                  ["CUSTOMER", "INTERIOR DESIGNER"].includes(profile)),
          )
          .map((profile) => (
            <option key={profile} value={profile}>
              {profile}
            </option>
          ))}
      </select>

      {(isEdit || isView) && (
        <>
          <label htmlFor="register_status">Status</label>
          <select
            id="register_status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isView || isSelfEdit}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Suspended</option>
          </select>
        </>
      )}

      {isRegister && !isView && (
        <div className="terms_container">
          <label className="terms_label">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />

            <span>
              I agree to the{" "}
              <a target="_blank" rel="noopener noreferrer">
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>
      )}

      {!isView && <button type="submit">{buttonText}</button>}
    </form>
  );
}

export default UserForm;
