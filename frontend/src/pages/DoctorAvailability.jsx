import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const DoctorAvailability = () => {
  const { user, token } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  useEffect(() => {
    if (user && user.availability) setAvailability(user.availability);
  }, [user]);

  const addSlot = () => {
    if (!date || !slot) return;
    const existing = availability.find(a => a.date === date);
    if (existing) {
      existing.slots.push(slot);
    } else {
      availability.push({ date, slots: [slot] });
    }
    setSlot("");
    setDate("");
  };

  const saveAvailability = async () => {
    try {
      await axios.put(
        `https://lifeline3-1.onrender.com/api/user/availability/${user.uid}`,
        { availability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Availability saved.");
    } catch (err) {
      alert("Failed to save.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-white bg-gray-900 rounded-xl mt-10">
      <h2 className="text-xl font-bold mb-4">Set Availability</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="time" value={slot} onChange={(e) => setSlot(e.target.value)} />
      <button onClick={addSlot} className="ml-2 bg-blue-500 px-3 py-1 rounded">Add</button>
      <ul className="mt-4">
        {availability.map((a, i) => (
          <li key={i}>
            <strong>{a.date}</strong>: {a.slots.join(", ")}
          </li>
        ))}
      </ul>
      <button onClick={saveAvailability} className="mt-4 bg-green-500 px-4 py-2 rounded">Save Availability</button>
    </div>
  );
};

export default DoctorAvailability;
