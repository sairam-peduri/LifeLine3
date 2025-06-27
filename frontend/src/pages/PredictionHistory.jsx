import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./PredictionHistory.css";

const PredictionHistory = () => {
  const { user, firebaseUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await firebaseUser.getIdToken();

      // ✅ Corrected backend URL and fetch by user._id (Mongo ID)
      const res = await fetch(
        `https://lifeline3-1.onrender.com/api/history/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Error loading history:", err);
      setError("Failed to load prediction history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="history-page">
      <Navbar />
      <div className="history-container">
        <h1>Prediction History</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : history.length === 0 ? (
          <p>No predictions found.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Predicted Disease</th>
                <th>Symptoms</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history
                .slice()
                .reverse()
                .map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.predictedDisease || item.disease || "Unknown"}</td>
                    <td>{item.symptoms?.join(", ") || "N/A"}</td>
                    <td>
                      {new Date(item.predictedAt || item.timestamp || Date.now()).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PredictionHistory;
