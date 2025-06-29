import axios from "axios";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./ManageAppointments.css";


const ManageAppointments = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    if (!user || !token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `https://lifeline3-1.onrender.com/api/appointments/user/${user._id}?role=doctor`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const sorted = res.data.sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      );
      setAppointments(sorted);
    } catch (err) {
      console.error("❌ Failed to load appointments:", err);
      alert("Error fetching appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdate = async (id, status) => {
    const confirmed = window.confirm(`Are you sure you want to ${status} this appointment?`);
    if (!confirmed) return;

    try {
      setUpdatingId(id);
      await axios.put(
        `https://lifeline3-1.onrender.com/api/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAppointments(); // Refresh list
    } catch (err) {
      console.error("❌ Failed to update appointment:", err);
      alert("Update failed. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
    <Navbar user={user}/>
<div className="manage-container mx-auto">
  <h2 className="manage-title">🩺 Manage Appointments</h2>

  {loading ? (
    <p className="text-gray-400">Loading appointments...</p>
  ) : appointments.length === 0 ? (
    <p className="text-gray-400">No appointment requests found.</p>
  ) : (
    appointments.map((appt) => (
      <div key={appt._id} className="appointment-card">
        <div className="appointment-info">
          <p><strong>👤 Patient:</strong> {appt.patientId?.name || "Unknown"}</p>
          <p><strong>📅 Date:</strong> {appt.date}</p>
          <p><strong>⏰ Time:</strong> {appt.time}</p>
          <p><strong>📝 Reason:</strong> {appt.reason || "N/A"}</p>
          <p>
            <strong>📌 Status:</strong>{" "}
            <span
              className={`status-text ${
                appt.status === "accepted"
                  ? "status-accepted"
                  : appt.status === "rejected"
                  ? "status-rejected"
                  : "status-pending"
              }`}
            >
              {appt.status.toUpperCase()}
            </span>
          </p>
        </div>

        {appt.status === "pending" && (
          <div className="button-group">
            <button
              onClick={() => handleUpdate(appt._id, "accepted")}
              className="button-accept"
              disabled={updatingId === appt._id}
            >
              ✅ Accept
            </button>
            <button
              onClick={() => handleUpdate(appt._id, "rejected")}
              className="button-reject"
              disabled={updatingId === appt._id}
            >
              ❌ Reject
            </button>
          </div>
        )}
      </div>
    ))
  )}
</div>
    </>
  );
};

export default ManageAppointments;
