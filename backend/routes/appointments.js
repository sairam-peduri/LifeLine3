const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");

// 1. Book Appointment
router.post("/", verifyToken, async (req, res) => {
  const { patientId, doctorId, date, time, reason } = req.body;

  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const exists = await Appointment.findOne({ doctorId, date, time });
    if (exists) return res.status(400).json({ error: "Slot already booked" });

    const appt = new Appointment({ patientId, doctorId, date, time, reason });
    await appt.save();
    res.json({ message: "Appointment booked", appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking failed" });
  }
});

// 2. Get Appointments by User
router.get("/user/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const role = req.query.role;
  const filter = role === "doctor" ? { doctorId: userId } : { patientId: userId };

  try {
    const data = await Appointment.find(filter)
      .populate("patientId", "name")
      .populate("doctorId", "name specialization")
      .sort({ date: 1, time: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// 3. Update Status
router.put("/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});
// GET Available Slots for a doctor on a given date
router.get("/available", verifyToken, async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: "Missing doctorId or date" });
  }

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const weekly = doctor.availability?.weekly;
    if (!weekly) {
      console.log("❌ No availability set for doctor.");
      return res.json([]);
    }

    console.log("📅 Raw doctor availability:", weekly);

    // Ensure fromTime and toTime are present
    if (!weekly.fromTime || !weekly.toTime || !Array.isArray(weekly.days)) {
      console.log("❌ Invalid time/day configuration:", weekly);
      return res.json([]);
    }

    // Convert string date to Date object and extract weekday in IST
    const validDate = new Date(date + "T00:00:00");
    if (isNaN(validDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const weekday = validDate.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });

    console.log("➡️ Selected Date:", date);
    console.log("🗓️ Weekday:", weekday);
    console.log("👨‍⚕️ Available Days:", weekly.days);

    if (!weekly.days.includes(weekday)) {
      console.log("❌ Doctor not available on this weekday.");
      return res.json([]);
    }

    const slotDuration = parseInt(weekly.slotDuration) || 30;

    const start = new Date(`${date}T${weekly.fromTime}`);
    const end = new Date(`${date}T${weekly.toTime}`);
    const slots = [];

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.log("❌ Invalid fromTime or toTime:", weekly.fromTime, weekly.toTime);
      return res.json([]);
    }

    for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes() + slotDuration)) {
      const slotTime = t.toTimeString().slice(0, 5); // HH:MM
      slots.push(slotTime);
    }

    console.log("⏳ Generated Slots:", slots);

    // Remove booked slots
    const booked = await Appointment.find({ doctorId, date }).select("time");
    const bookedTimes = booked.map((b) => b.time);

    console.log("📌 Already booked:", bookedTimes);

    const available = slots.filter((t) => !bookedTimes.includes(t));
    console.log("✅ Available slots:", available);

    res.json(available);
  } catch (err) {
    console.error("❌ Error fetching slots:", err);
    res.status(500).json({ error: "Server error fetching slots" });
  }
});

module.exports = router;