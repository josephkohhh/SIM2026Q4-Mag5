import { useLocation } from "react-router-dom";
import UserForm from "./Component/UserForm";
import './edituser.css'

function Viewuser(){
    const location = useLocation();
    const user = location.state?.user;

    if (!user) {
        return <p>No user selected.</p>;
    }

    return (
        <section className="edituser_panel">
            <div className="edituser_form">
                <h1>View {user.username}'s Account</h1>
                <UserForm initialData={user} isAdmin={true} isView={true}/>
            </div>
        </section>
    )
}

export default Viewuser;