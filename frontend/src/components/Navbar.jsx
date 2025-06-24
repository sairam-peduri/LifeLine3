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
  const [balance, setBalance] = useState(null);
  const [loadingBal, setLoadingBal] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
            <div className="dropdown">
              <span onClick={() => setDropdownOpen(!dropdownOpen)}>☰</span>
              {dropdownOpen && (
                <div className="dropdown-content">
                  <span onClick={() => navigate("/profile")}>Profile</span>
                  <span onClick={() => navigate("/doctors")}>Doctors Directory</span>
                  <span onClick={() => navigate("/chat")}>Chat Inbox 💬</span>
                  <span onClick={() => navigate("/transactions")}>Transactions</span>
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
