import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
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

  // 📌 Format date to YYYY-MM-DD (used when converting from input)
  const formatDate = (dateObj) => {
    const iso = new Date(dateObj).toISOString();
    return iso.split("T")[0]; // Get YYYY-MM-DD
  };

  // 🔄 Fetch list of doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          "https://lifeline3-1.onrender.com/api/user?role=doctor",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDoctors(res.data);

        if (doctorIdFromUrl) {
          const found = res.data.find((d) => d._id === doctorIdFromUrl);
          if (found) setSelectedDoctor(found);
        }
      } catch (err) {
        console.error("❌ Failed to fetch doctors:", err);
      }
    };

    if (token) fetchDoctors();
  }, [token]);

  // 🕓 Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchSlots(selectedDoctor._id, selectedDate);
    }
  }, [selectedDoctor, selectedDate]);

  const fetchSlots = async (doctorId, date) => {
    try {
      const res = await axios.get(
        "https://lifeline3-1.onrender.com/api/appointments/available",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { doctorId, date },
        }
      );
      console.log("✅ Available slots:", res.data);
      setSlots(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch slots:", err);
      setSlots([]);
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000);
      setSelectedDate("");
      setTime("");
      setReason("");
      setSlots([]);
    } catch (err) {
      console.error("❌ Booking failed:", err);
      alert("Booking failed.");
    }
  };

  return (
    <>
    <Navbar user={user}/>
    <div className="max-w-xl mx-auto p-6 text-white bg-gray-900 mt-10 rounded relative">
      <h2 className="text-xl font-bold mb-4">📅 Book Appointment</h2>

      {/* 👨‍⚕️ Doctor dropdown */}
      {!doctorIdFromUrl && (
        <select
          className="w-full mb-4 p-2 bg-gray-800 rounded"
          value={selectedDoctor?._id || ""}
          onChange={(e) => {
            const doc = doctors.find((d) => d._id === e.target.value);
            setSelectedDoctor(doc);
            setSelectedDate("");
            setTime("");
            setSlots([]);
          }}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              Dr. {doc.name} ({doc.specialization})
            </option>
          ))}
        </select>
      )}

      {/* 📆 Date Picker */}
      {selectedDoctor && (
        <>
          <input
            type="date"
            className="w-full mb-4 p-2 bg-gray-800 rounded"
            value={selectedDate}
            onChange={(e) => {
              const formatted = formatDate(e.target.value);
              setSelectedDate(formatted);
              setTime("");
              setSlots([]);
            }}
          />

          {/* 🗓️ Optional Debug Info */}
          {selectedDate && (
            <p className="text-sm text-gray-400 mb-2">
              Selected Date: {selectedDate} (
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                timeZone: "Asia/Kolkata",
              })}
              )
            </p>
          )}

          {/* ⏰ Slot Picker */}
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
              ⚠️ No slots available for this date.
            </p>
          )}

          {/* ✏️ Reason */}
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
    </>
  );
};

export default BookAppointment;
