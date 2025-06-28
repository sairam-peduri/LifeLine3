import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EditAvailability = () => {
  const { user, token } = useAuth();
  const [days, setDays] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [slotDuration, setSlotDuration] = useState(30);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user.availability) {
      setDays(user.availability.days || []);
      setFromTime(user.availability.fromTime || "");
      setToTime(user.availability.toTime || "");
      setSlotDuration(user.availability.slotDuration || 30);
    }
  }, [user]);

  const toggleDay = d => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `https://lifeline3-1.onrender.com/api/user/${user.uid}/availability`,
        { days, fromTime, toTime, slotDuration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Availability updated successfully");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update availability");
    }
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-900 text-white rounded mt-10">
      <h2 className="text-2xl font-bold mb-4">Set Weekly Availability</h2>

      <div className="mb-4">
        <label className="font-semibold">Days:</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {WEEKDAYS.map(d => (
            <label key={d} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={days.includes(d)}
                onChange={() => toggleDay(d)}
                className="form-checkbox mr-2"
              />
              {d}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label>From:</label>
        <input type="time" value={fromTime} onChange={e => setFromTime(e.target.value)}
               className="ml-2 bg-gray-800 p-2 rounded"/>
      </div>

      <div className="mb-4">
        <label>To:</label>
        <input type="time" value={toTime} onChange={e => setToTime(e.target.value)}
               className="ml-2 bg-gray-800 p-2 rounded"/>
      </div>

      <div className="mb-4">
        <label>Slot Duration (min):</label>
        <select
          value={slotDuration}
          onChange={e => setSlotDuration(Number(e.target.value))}
          className="ml-2 bg-gray-800 p-2 rounded"
        >
          {[15,30,45,60].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <button onClick={handleSave} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
        Save Availability
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default EditAvailability;
