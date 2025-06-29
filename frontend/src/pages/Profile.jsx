import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getPredictionHistory } from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const COLORS = ["#00d2ff", "#3a7bd5", "#6a82fb", "#f093fb", "#f5576c", "#4facfe", "#43e97b", "#ff6a00", "#ffe000"];

const Profile = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user || !token) return;
    (async () => {
      try {
        const res = await getPredictionHistory(user.name, token);
        setHistory(res.reverse());
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    })();
  }, [user, token]);

  if (!user) return <div className="loading-screen">Loading profile…</div>;

  const diseaseChart = Object.entries(
    history.reduce((acc, item) => {
      acc[item.disease] = (acc[item.disease] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const symptomChart = Object.entries(
    history.reduce((acc, item) => {
      item.symptoms.forEach(sym => acc[sym] = (acc[sym] || 0) + 1);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="profile-wrapper">
      <Navbar />

      {/* 👤 Unified Profile Card */}
      <div style={{ marginTop: "80px" }}className="profile-card">
        <div className="profile-header">
          <img className="avatar" src="/assets/avatar.jpg" alt="User Avatar" />
          <div>
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-role">{user.role || "Patient"}</p>
          </div>
        </div>

        <div className="profile-info-grid">
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Gender:</strong> {user.gender}</div>
          <div><strong>Date of Birth:</strong> {user.dob}</div>

          {user.role === "doctor" && (
            <>
              <div><strong>Specialization:</strong> {user.specialization}</div>
              <div><strong>Workplace:</strong> {user.workplace}</div>
              <div><strong>Consultation Fee:</strong> {user.consultationFee} SOL</div>
              <div style={{ gridColumn: "1 / -1" }}><strong>About:</strong> {user.about}</div>
            </>
          )}
        </div>

        <div className="profile-button-container">
          <button className="edit-profile-btn" onClick={() => navigate("/edit-profile")}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* 🧾 Recent Predictions */}
      {history.length > 0 && (
        <div className="profile-card">
          <h2>🧾 Recent Predictions</h2>
          <div className="recent-predictions">
            {history.slice(0, 3).map((item, idx) => (
              <div key={idx} className="prediction-box">
                <p><strong>Disease:</strong> {item.disease}</p>
                <p><strong>Symptoms:</strong> {item.symptoms.join(", ")}</p>
                <p><strong>Date:</strong> {new Date(item.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📊 Charts */}
      {diseaseChart.length > 0 && (
        <div className="profile-card">
          <h2>📊 Most Predicted Diseases</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={diseaseChart}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="count" fill="#00d2ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {symptomChart.length > 0 && (
        <div className="profile-card">
          <h2>🧬 Symptoms Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={symptomChart}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                outerRadius={100}
              >
                {symptomChart.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="profile-button-container">
        <button className="view-history-btn" onClick={() => navigate("/transactions")}>
          💸 View Transaction History
        </button>
      </div>
    </div>
  );
};

export default Profile;
