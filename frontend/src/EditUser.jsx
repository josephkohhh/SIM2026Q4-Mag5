import { useLocation, useNavigate } from "react-router-dom";
import UserForm from "./Component/UserForm";
import './edituser.css';

function EditUser(){
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user;

    async function handleEdit(formData) {
        const response = await fetch(`http://localhost:8000/users/${user.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            }
        );
        const data = await response.json();

        if (!response.ok) {
            alert("Failed to Update, Please try it againt, If the problem persists, contact technical support.")
            return;
        }

        alert("User updated successfully");
        navigate("/admin_portal");
    }

    if (!user) {
        return <p>No user selected.</p>;
    }

    return (
        <section className="edituser_panel">
            <div className="edituser_form">
                <h1>Edit User Account</h1>
                <UserForm buttonText ="Save" onSubmit={handleEdit} isAdmin={true} initialData={user} isEdit={true}/>
            </div>
        </section>
    )
}

export default EditUser;
