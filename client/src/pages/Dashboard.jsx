import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom"; 

export default function Dashboard() {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <h2>Please Refresh the Page</h2>
            {!!user && (<h2>Welcome {user.name}!</h2>)}
            {user && <button onClick={handleLogout}>Logout</button>}
        </div>
    );
}
