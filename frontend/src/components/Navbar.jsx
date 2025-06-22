// src/components/Navbar.jsx
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isDoctor, setIsDoctor] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loadingBal, setLoadingBal] = useState(true);

  useEffect(() => {
    setIsDoctor(user?.role === "doctor");
  }, [user]);

  useEffect(() => {
    async function fetchBalance() {
      if (!wallet.publicKey) {
        setBalance(null);
        setLoadingBal(false);
        return;
      }
      try {
        setLoadingBal(true);
        const lamports = await connection.getBalance(wallet.publicKey);
        setBalance(lamports / 1e9);
      } catch (err) {
        console.error("Error fetching balance:", err);
        setBalance(null);
      } finally {
        setLoadingBal(false);
      }
    }
    fetchBalance();
  }, [wallet.publicKey, connection]);

  return (
    <nav className="navbar navbar-dark bg-dark fixed-top">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <span
          className="navbar-brand"
          role="button"
          onClick={() => navigate("/dashboard")}
          style={{ fontSize: 35 }}
        >
          Life Line
        </span>

        <div className="d-flex align-items-center gap-2">
          <WalletMultiButton className="btn btn-primary" />

          {wallet.connected && (
            <span className="text-light">
              {loadingBal ? "Loading SOL..." : `${balance?.toFixed(4)} SOL`}
            </span>
          )}

          <button
            className="navbar-toggler ms-2"
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
      </div>

      <div
        className="offcanvas offcanvas-end text-bg-dark"
        id="offcanvasDarkNavbar"
        tabIndex="-1"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">
            {user?.name || "User"}
          </h5>
          <button
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav flex-grow-1 pe-3">
            <li className="nav-item">
              <span
                className="nav-link active"
                role="button"
                onClick={() => navigate("/dashboard")}
              >
                Home
              </span>
            </li>
            <li className="nav-item">
              <span
                className="nav-link"
                role="button"
                onClick={() => navigate("/profile")}
              >
                User Details
              </span>
            </li>
            <li className="nav-item">
              <span
                className="nav-link"
                role="button"
                onClick={() => navigate("/doctors")}
              >
                Doctor Directory
              </span>
            </li>
            <li className="nav-item">
              <span
                className="nav-link"
                role="button"
                onClick={() => 
                  navigate("/chat")}
                style={{ opacity: wallet.connected ? 1 : 0.5 }}
              >
                Chat Inbox 💬
              </span>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={() => navigate("/transactions")}>
                Transactions 💸
              </a>
            </li>
            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
              >
                More
              </span>
              <ul className="dropdown-menu dropdown-menu-dark">
                <li>
                  <span className="dropdown-item">About</span>
                </li>
                <li>
                  <span className="dropdown-item">Facts</span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <span className="dropdown-item">Contact</span>
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
}
