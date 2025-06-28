import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BookAppointment = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const doctorIdFromUrl = new URLSearchParams(location.search).get("doctorId");

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Fetch doctor list & set selected doctor if ID is passed in URL
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          "https://lifeline3-1.onrender.com/api/user?role=doctor",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const allDoctors = res.data;
        setDoctors(allDoctors);

        if (doctorIdFromUrl) {
          const doc = allDoctors.find((d) => d._id === doctorIdFromUrl);
          if (doc) setSelectedDoctor(doc);
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };

    if (token) fetchDoctors();
  }, [token]);

  const fetchSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      const res = await axios.get(
        `https://lifeline3-1.onrender.com/api/appointments/available`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { doctorId, date },
        }
      );
      setSlots(res.data);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    }
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !time) return;

    try {
      await axios.post(
        "https://lifeline3-1.onrender.com/api/appointments",
        {
          patientId: user._id,
          doctorId: selectedDoctor._id,
          date: selectedDate,
          time,
          reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000);
      setSelectedDate("");
      setTime("");
      setReason("");
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-white bg-gray-900 mt-10 rounded relative">
      <h2 className="text-xl font-bold mb-4">📅 Book Appointment</h2>

      {/* Doctor dropdown if not selected from URL */}
      {!doctorIdFromUrl && (
        <select
          className="w-full mb-4 p-2 bg-gray-800 rounded"
          onChange={(e) => {
            const doc = doctors.find((d) => d._id === e.target.value);
            setSelectedDoctor(doc);
            setSelectedDate("");
            setSlots([]);
            setTime("");
          }}
          value={selectedDoctor?._id || ""}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              Dr. {doc.name} ({doc.specialization})
            </option>
          ))}
        </select>
      )}

      {/* Date and slot selection */}
      {selectedDoctor && (
        <>
          <input
            type="date"
            className="w-full mb-4 p-2 bg-gray-800 rounded"
            value={selectedDate}
            onChange={(e) => {
              const rawDate = new Date(e.target.value);
              const formatted = rawDate.toISOString().split("T")[0]; // Ensure YYYY-MM-DD
              setSelectedDate(formatted);
              fetchSlots(selectedDoctor._id, formatted);
            }}
          />

          {/* Optional Debug Info */}
          {selectedDate && (
            <p className="text-sm text-gray-400 mb-2">
              Selected Date: {selectedDate} (
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
              })}
              )
            </p>
          )}

          {slots.length > 0 ? (
            <select
              className="w-full mb-4 p-2 bg-gray-800 rounded"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="">Select Time</option>
              {slots.map((s, idx) => (
                <option key={idx}>{s}</option>
              ))}
            </select>
          ) : selectedDate && (
            <p className="text-yellow-400 mb-4">
              No slots available for this date.
            </p>
          )}

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for appointment"
            className="w-full mb-4 p-2 bg-gray-800 rounded"
          />

          <button
            onClick={handleBook}
            disabled={!selectedDate || !time}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Submit
          </button>
        </>
      )}

      {showPopup && (
        <div className="absolute bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✅ Appointment requested successfully!
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
