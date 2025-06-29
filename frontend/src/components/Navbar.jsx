import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(null);
  const [loadingBal, setLoadingBal] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar-custom">
      <div className="navbar-container">
        <div className="navbar-left" onClick={() => navigate("/dashboard")}>
          <span className="logo-text">LifeLine</span>
        </div>

        <div className="navbar-center">
          <span onClick={() => navigate("/dashboard")}>Home</span>
          <span onClick={() => navigate("/about")}>About</span>
          <span onClick={() => navigate("/contact")}>Contact</span>
        </div>

        <div className="navbar-right">
          <WalletMultiButton />
          {wallet.connected && (
            <span className="balance">
              {loadingBal ? "Loading..." : `${balance?.toFixed(4)} SOL`}
            </span>
          )}

          {user ? (
            <div className="dropdown" ref={dropdownRef}>
              <span onClick={() => setDropdownOpen(!dropdownOpen)}>☰</span>
              {dropdownOpen && (
                <div className="dropdown-content">
                  <span onClick={() => navigate("/profile")}>Profile</span>
                  <span onClick={() => navigate("/doctors")}>Doctors Directory</span>
                  <span onClick={() => navigate("/chat")}>Chat Inbox</span>
                  <span onClick={() => navigate("/transactions")}>Transactions</span>
                  <span onClick={() => navigate("/history")}>Prediction History</span>

                  {user.role === "doctor" ? (
                    <>
                      <span onClick={() => navigate("/set-availability")}>Set Availability </span>
                      <span onClick={() => navigate("/manage-appointments")}>Manage Requests </span>
                    </>
                  ) : (
                    <>
                      <span onClick={() => navigate("/book-appointment")}>Book Appointment </span>
                      <span onClick={() => navigate("/my-appointments")}>My Appointments </span>
                    </>
                  )}

                  <button onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
