import UserForm from "./Component/UserForm";
import "./createuser.css";
import { useNavigate } from "react-router-dom";

function CreateUser(){
    const navigate = useNavigate();
    async function createuser(userdata){
        console.log(userdata);
        const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(userdata),
        });

        const data = await response.json();
        if (data.success) {
            alert("Account Created successful");
            navigate("/admin_portal", { replace: true });
        } else {
            alert("Failed to Create Account");
        }
    }

    return(
            <section className="createuser_panel">
                <div className="createuser_form">
                <h1>Create an account</h1>
                <UserForm buttonText="Create" onSubmit={createuser} isAdmin={true}/>
                </div>
            </section>
    )
}

export default CreateUser;