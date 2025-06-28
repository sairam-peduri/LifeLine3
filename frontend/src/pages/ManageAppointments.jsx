import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ManageAppointments = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://lifeline3-1.onrender.com/api/appointments/user/${user._id}?role=doctor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sorted = res.data.sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      );
      setAppointments(sorted);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this appointment?`)) return;
    try {
      setUpdatingId(id);
      await axios.put(
        `https://lifeline3-1.onrender.com/api/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      alert("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 text-white p-6 bg-gray-900 rounded">
      <h2 className="text-2xl font-bold mb-6">Manage Appointments</h2>

      {loading ? (
        <p className="text-gray-400">Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-400">No appointment requests found.</p>
      ) : (
        appointments.map((appt) => (
          <div key={appt._id} className="border-b border-gray-700 py-4">
            <p><strong>Patient:</strong> {appt.patientId.name}</p>
            <p><strong>Date:</strong> {appt.date}</p>
            <p><strong>Time:</strong> {appt.time}</p>
            <p><strong>Reason:</strong> {appt.reason || "N/A"}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={
                appt.status === "accepted" ? "text-green-400" :
                appt.status === "rejected" ? "text-red-400" :
                "text-yellow-400"
              }>
                {appt.status.toUpperCase()}
              </span>
            </p>

            {appt.status === "pending" && (
              <div className="mt-2">
                <button
                  onClick={() => handleUpdate(appt._id, "accepted")}
                  className="bg-green-600 px-4 py-1 mr-2 rounded hover:bg-green-700"
                  disabled={updatingId === appt._id}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleUpdate(appt._id, "rejected")}
                  className="bg-red-600 px-4 py-1 rounded hover:bg-red-700"
                  disabled={updatingId === appt._id}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ManageAppointments;
