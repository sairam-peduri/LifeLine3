import axios from "axios";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const MyAppointments = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `https://lifeline3-1.onrender.com/api/appointments/user/${user._id}?role=patient`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to load appointments", err);
      }
    };

    if (user && token) fetchAppointments();
  }, [user, token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted": return "text-green-400";
      case "rejected": return "text-red-400";
      default: return "text-yellow-400";
    }
  };

  return (
    <>
    <Navbar user={user}/>
    <div style={{ marginTop: "80px" }} className="max-w-3xl mx-auto mt-10 p-6 bg-gray-900 text-white rounded">
      <h2 className="text-xl font-bold mb-4">📅 My Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="border border-gray-700 p-4 rounded">
              <p><strong>Doctor:</strong> Dr. {appt.doctorId.name} ({appt.doctorId.specialization})</p>
              <p><strong>Date:</strong> {appt.date}</p>
              <p><strong>Time:</strong> {appt.time}</p>
              <p><strong>Reason:</strong> {appt.reason || "N/A"}</p>
              <p><strong>Status:</strong> <span className={getStatusColor(appt.status)}>{appt.status.toUpperCase()}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default MyAppointments;
