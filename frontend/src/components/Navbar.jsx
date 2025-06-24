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
        <div className="logo" onClick={() => navigate("/dashboard")}>
          <img src="/logo192.png" alt="LifeLine Logo" />
          <span>LifeLine</span>
        </div>
        <div className="nav-links">
          <span onClick={() => navigate("/dashboard")}>Home</span>
          <span onClick={() => navigate("/about")}>About</span>
          <span onClick={() => navigate("/contact")}>Contact</span>
          <span onClick={() => navigate("/transactions")}>Wallet</span>
        </div>
        <div className="wallet-section">
          <WalletMultiButton />
          {wallet.connected && (
            <span className="balance">
              {loadingBal ? "Loading..." : `${balance?.toFixed(4)} SOL`}
            </span>
          )}
          <div className="menu-icon" onClick={() => {
            document.getElementById("mobile-menu").classList.toggle("open");
          }}>
            ☰
          </div>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu">
        {user ? (
          <>
            <span onClick={() => navigate("/profile")}>User Details</span>
            <span onClick={() => navigate("/doctors")}>Search Doctors</span>
            <span
              onClick={() => navigate("/chat")}
              style={{ opacity: wallet.connected ? 1 : 0.5 }}
            >
              Chat Inbox 💬
            </span>
            <button className="logout-button" onClick={logout}>Logout</button>
          </>
        ) : (
          <button className="login-button" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
