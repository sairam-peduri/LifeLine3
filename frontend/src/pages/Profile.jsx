// src/pages/Profile.jsx
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
  XAxis, YAxis
} from "recharts";
import { getPredictionHistory } from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext"; // ✅ Import useAuth
import "./Profile.css";

const COLORS = ["#3182ce", "#63b3ed", "#90cdf4", "#a0aec0", "#68d391", "#f6ad55", "#fc8181", "#ed64a6", "#d53f8c"];

const Profile = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth(); // ✅ use context
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user || !token) return;

    const fetchData = async () => {
      try {
        const res = await getPredictionHistory(user.name, token); // ✅ pass token
        setHistory(res.reverse());
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    fetchData();
  }, [user, token]);

  if (!user) {
    return <div>Loading...</div>;
  }

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
      <Navbar user={user} />

      <div className="profile-card">
        <div className="profile-sidebar">
          <img className="avatar" src="/user-avatar.svg" alt="User" />
          <div className="profile-title">{user.name}</div>
          <div className="profile-role">{user.role || "Patient"}</div>
        </div>
        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Gender:</strong> {user.gender}</p>
          <p><strong>DOB:</strong> {user.dob}</p>
        </div>
      </div>

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

      {diseaseChart.length > 0 && (
        <div className="profile-card">
          <h2>📊 Most Predicted Diseases</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={diseaseChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {symptomChart.length > 0 && (
        <div className="profile-card">
          <h2>🧬 Symptoms Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={symptomChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
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
        <button className="view-history-btn" onClick={() => navigate("/history")}>
          View Full History
        </button>
      </div>
    </div>
  );
};

export default Profile;
