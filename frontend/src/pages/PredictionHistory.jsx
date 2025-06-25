import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./PredictionHistory.css";

const ITEMS_PER_PAGE = 10;

const PredictionHistory = () => {
  const { user, firebaseUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchHistory();
  }, [page, user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await firebaseUser.getIdToken();
      const res = await fetch(
        `/api/predictions?uid=${user.uid}&page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setHistory(data.history || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load prediction history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    const confirm = window.confirm("Delete this prediction?");
    if (!confirm) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/predictions/${user.uid}/${entryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchHistory(); // Refresh history
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Could not delete entry.");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

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
                <th>Date</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={item._id}>
                  <td>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td>{item.predictedDisease}</td>
                  <td>{item.symptoms.join(", ")}</td>
                  <td>{new Date(item.predictedAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleDelete(item._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ⬅️ Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionHistory;
