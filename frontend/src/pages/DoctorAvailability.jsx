import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const DoctorAvailability = () => {
  const { user, token } = useAuth();
  const [perDateAvailability, setPerDateAvailability] = useState([]);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  useEffect(() => {
    if (user?.availability?.perDate) {
      setPerDateAvailability(user.availability.perDate);
    }
  }, [user]);

  const addSlot = () => {
    if (!date || !slot) return;
    setPerDateAvailability((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((a) => a.date === date);
      if (index !== -1) {
        if (!updated[index].slots.includes(slot)) {
          updated[index].slots.push(slot);
        }
      } else {
        updated.push({ date, slots: [slot] });
      }
      return updated;
    });
    setSlot("");
    setDate("");
  };

  const saveAvailability = async () => {
    try {
      const existingWeekly = user?.availability?.weekly || {};
      const newAvailability = {
        weekly: existingWeekly,
        perDate: perDateAvailability,
      };

      await axios.put(
        `https://lifeline3-1.onrender.com/api/user/${user.uid}/availability`,
        { availability: newAvailability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Availability saved.");
    } catch (err) {
      console.error("Error saving availability:", err);
      alert("Failed to save.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-white bg-gray-900 rounded-xl mt-10">
      <h2 className="text-xl font-bold mb-4">Set Date-Specific Availability</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 bg-gray-800 rounded"
        />
        <input
          type="time"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="p-2 bg-gray-800 rounded"
        />
        <button
          onClick={addSlot}
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          ➕ Add
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {perDateAvailability.length > 0 ? (
          perDateAvailability.map((a, i) => (
            <li key={i} className="bg-gray-800 p-3 rounded">
              <strong>{a.date}</strong>: {a.slots.join(", ")}
            </li>
          ))
        ) : (
          <p className="text-yellow-400">No availability set.</p>
        )}
      </ul>

      <button
        onClick={saveAvailability}
        className="mt-4 bg-green-500 px-4 py-2 rounded hover:bg-green-600"
      >
        Save Availability
      </button>
    </div>
  );
};

export default DoctorAvailability;
