import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
export default function NavBar() {
    const {IsloggedIn}=useContext(AppContext);
    return <>
        <div className="navContainer">
            <h1>MERN-AUTH</h1>
            <div className="nav-links">
                <ul>
                    <li>
                        <Link to='/' style={{ padding: "10px" }} >Home</Link>
                    </li>
                </ul>
                <ul>
                    {!IsloggedIn?<li><Link to='/login'>Login</Link></li>:""}
                </ul>
            </div>
        </div>
    </>
}