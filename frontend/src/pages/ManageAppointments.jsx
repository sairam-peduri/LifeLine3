import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ManageAppointments = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    const res = await axios.get(
      `https://lifeline3-1.onrender.com/api/appointments/user/${user._id}?role=doctor`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setAppointments(res.data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdate = async (id, status) => {
    await axios.put(
      `https://lifeline3-1.onrender.com/api/appointments/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAppointments(); // refresh
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 text-white p-4 bg-gray-900 rounded">
      <h2 className="text-xl font-bold mb-4">Manage Appointments</h2>
      {appointments.map((appt) => (
        <div key={appt._id} className="border-b border-gray-700 py-2">
          <p><strong>Patient:</strong> {appt.patientId.name}</p>
          <p><strong>Date:</strong> {appt.date}</p>
          <p><strong>Time:</strong> {appt.time}</p>
          <p><strong>Reason:</strong> {appt.reason || "N/A"}</p>
          <p><strong>Status:</strong> {appt.status}</p>
          {appt.status === "pending" && (
            <>
              <button onClick={() => handleUpdate(appt._id, "accepted")} className="mr-2 bg-green-500 px-3 py-1 rounded">Accept</button>
              <button onClick={() => handleUpdate(appt._id, "rejected")} className="bg-red-500 px-3 py-1 rounded">Reject</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ManageAppointments;
