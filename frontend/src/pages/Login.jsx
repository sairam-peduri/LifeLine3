import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // ✅ make sure this exports `auth`

const Login = () => {
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      const res = await axios.post(
        "http://localhost:5000/api/auth/login", // ✅ make sure this matches your backend
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

      // ✅ Navigate based on profile completion
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
    <div>
      <h2>Login</h2>
      <button onClick={loginWithGoogle}>Sign in with Google</button>
    </div>
  );
};

export default Login;
