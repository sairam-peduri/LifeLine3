import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EditAvailability = () => {
  const { user, getFreshToken } = useAuth(); // ✅ use getFreshToken
  const [days, setDays] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [slotDuration, setSlotDuration] = useState(30);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const w = user?.availability?.weekly;
    if (w) {
      setDays(w.days || []);
      setFromTime(w.fromTime || "");
      setToTime(w.toTime || "");
      setSlotDuration(w.slotDuration || 30);
    }
  }, [user]);

  const toggle = (d) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const save = async () => {
    try {
      const token = await getFreshToken(); // ✅ Fetch fresh token

      const newAvailability = {
        weekly: { days, fromTime, toTime, slotDuration },
      };

      await axios.put(
        `https://lifeline3-1.onrender.com/api/user/${user.uid}/availability`,
        { availability: newAvailability },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMsg("✅ Saved");
    } catch (err) {
      console.error("Save failed:", err);
      setMsg("❌ Failed");
    }
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <>
    <Navbar user={user}/>
    <div className="p-6 bg-gray-900 text-white rounded max-w-xl mx-auto mt-10">
      <h2 className="text-2xl mb-4">Set Weekly Availability</h2>
      <div className="mb-4">
        {WEEKDAYS.map((d) => (
          <label key={d} className="inline-flex items-center mr-3">
            <input
              type="checkbox"
              checked={days.includes(d)}
              onChange={() => toggle(d)}
              className="mr-1"
            />
            {d}
          </label>
        ))}
      </div>
      <div className="mb-4">
        <label>From:</label>
        <input
          type="time"
          value={fromTime}
          onChange={(e) => setFromTime(e.target.value)}
          className="ml-2 bg-gray-800 p-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label>To:</label>
        <input
          type="time"
          value={toTime}
          onChange={(e) => setToTime(e.target.value)}
          className="ml-2 bg-gray-800 p-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label>Slot Duration:</label>
        <select
          value={slotDuration}
          onChange={(e) => setSlotDuration(Number(e.target.value))}
          className="ml-2 bg-gray-800 p-2 rounded"
        >
          {[15, 30, 45, 60].map((m) => (
            <option key={m} value={m}>
              {m} min
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={save}
        className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
      >
        Save
      </button>
      {msg && <p className="mt-2">{msg}</p>}
    </div>
    </>
  );
};

export default EditAvailability;
