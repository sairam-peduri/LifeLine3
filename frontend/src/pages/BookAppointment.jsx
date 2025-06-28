import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BookAppointment = () => {
  const { user, token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const doctorIdFromUrl = params.get("doctorId");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("https://lifeline3-1.onrender.com/api/user?role=doctor", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allDoctors = res.data;
        setDoctors(allDoctors);

        if (doctorIdFromUrl) {
          const doc = allDoctors.find(d => d._id === doctorIdFromUrl);
          if (doc) {
            setSelectedDoctor(doc);
          }
        }
      } catch (err) {
        console.error("Error loading doctors:", err);
      }
    };

    if (token) fetchDoctors();
  }, [token, doctorIdFromUrl]);

  const fetchSlots = async (doctorId, date) => {
    if (!doctorId || !date) return; // ✅ Prevent 400 error
    try {
      const res = await axios.get(`https://lifeline3-1.onrender.com/api/appointments/available`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { doctorId, date }
      });
      setSlots(res.data);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !time) {
      alert("Please select both date and time before booking.");
      return;
    }

    try {
      await axios.post(
        "https://lifeline3-1.onrender.com/api/appointments",
        {
          patientId: user._id,
          doctorId: selectedDoctor._id,
          date: selectedDate,
          time,
          reason
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
      alert("Booking failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-white bg-gray-900 mt-10 rounded relative">
      <h2 className="text-xl font-bold mb-4">📅 Book Appointment</h2>

      <select
        className="w-full mb-4 p-2 bg-gray-800 rounded"
        onChange={(e) => {
          const doc = doctors.find(d => d._id === e.target.value);
          setSelectedDoctor(doc);
          setSlots([]);
          setSelectedDate("");
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

      {selectedDoctor && (
        <>
          <input
            type="date"
            className="w-full mb-4 p-2 bg-gray-800 rounded"
            value={selectedDate}
            onChange={(e) => {
              const date = e.target.value;
              setSelectedDate(date);
              if (date) fetchSlots(selectedDoctor._id, date); // ✅ Only call if date is not empty
            }}
          />

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
            <p className="text-yellow-400 mb-4">No slots available for this date.</p>
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
