import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./home.css";

function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <Navbar/>
            <section className="hero">
                <h1>AI-Powered Personal Health Dashboard</h1>
                <div className="description">
                    <p>Your smart companion for disease prediction and prevention</p>
                </div>
                <div className="description">
                    <p>Revolutionize your health with our AI-powered personal health dashboard. Get real-time insights, predict diseases, and receive preventive tips for a healthier life.</p>
                </div>
                <div className="buttons">
                    <button onClick={() => navigate("/login")}>Login</button>
                    <button onClick={() => navigate("/signup")}>Sign Up</button>
                </div>
            </section>
        </div>
    );
}

export default Home;
