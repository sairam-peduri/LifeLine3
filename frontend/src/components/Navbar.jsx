// src/components/Navbar.jsx
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { connected } = useWallet();
  const [isDoctor, setIsDoctor] = useState(false);

  useEffect(() => {
    setIsDoctor(user?.role === "doctor");
  }, [user]);

  const handleChatClick = () => {
      navigate("/chat");
  };

  return (
    <nav className="navbar navbar-dark bg-dark fixed-top">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <a className="navbar-brand" href="#" style={{ fontSize: 35 }}>
          Life Line
        </a>
        <button
          className="navbar-toggler ms-3"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasDarkNavbar"
          aria-controls="offcanvasDarkNavbar"
          aria-label="Toggle navigation"
          style={{ width: "50px" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>

      <div
        className="offcanvas offcanvas-end text-bg-dark"
        tabIndex="-1"
        id="offcanvasDarkNavbar"
        aria-labelledby="offcanvasDarkNavbarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">
            {user?.name || "User"}
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body">
          <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
            <li className="nav-item">
              <a className="nav-link active" onClick={() => navigate("/dashboard")}>
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={() => navigate("/profile")}>
                User Details
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={() => navigate("/doctors")}>
                Doctor Directory
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={handleChatClick}>
                Chat Inbox 💬
              </a>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                More
              </a>
              <ul className="dropdown-menu dropdown-menu-dark">
                <li>
                  <a className="dropdown-item" href="#">About</a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">Facts</a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item" href="#">Contact</a>
                </li>
              </ul>
            </li>
          </ul>

          <button className="btn btn-danger w-100 mt-3" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
