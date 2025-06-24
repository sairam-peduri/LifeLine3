import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      const res = await axios.post(
        "https://lifeline3-1.onrender.com/api/auth/login",
        {
          email: user.email,
          name: user.displayName,
          uid: user.uid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { isNewUser, user: userData } = res.data;
      localStorage.setItem("token", token);

      if (isNewUser || !userData.isProfileComplete) {
        navigate("/signup", { state: { userData } });
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Google login failed.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>🔐 Login to LifeLine</h1>
        <p className="login-desc">
          Securely access your health dashboard with your Google account.
          We use Firebase Authentication to protect your medical data.
        </p>
        <button className="google-btn" onClick={loginWithGoogle}>
          <span className="icon">🟦</span> Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
