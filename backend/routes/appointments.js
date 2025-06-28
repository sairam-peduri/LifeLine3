const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");
const moment = require("moment");

// 1. Create Appointment Request (Patient books)
  router.post("/", verifyToken, async (req, res) => {
    const { patientId, doctorId, date, time, reason } = req.body;
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
  

// 2. Get All Appointments for a User (doctor or patient)
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

// 3. Update Appointment Status (doctor accepts/rejects)
router.put("/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status)) return res.status(400).json({ error: "Invalid status" });

  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.get("/available", verifyToken, async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ error: "Missing parameters" });

  try {
    const doc = await User.findById(doctorId);
    if (!doc || !doc.availability) return res.status(404).json({ error: "Doctor not found or no availability" });

    const per = doc.availability.perDate.find(p => p.date === date);
    if (per) {
      const booked = await Appointment.find({ doctorId, date }).select("time");
      const bookedTimes = booked.map(b => b.time);
      const avail = per.slots.filter(t => !bookedTimes.includes(t));
      return res.json(avail);
    }

    const weekday = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    const weekly = doc.availability.weekly;
    if (!weekly.days.includes(weekday)) return res.json([]);

    const [h1, m1] = weekly.fromTime.split(":").map(Number);
    const [h2, m2] = weekly.toTime.split(":").map(Number);
    let current = new Date(date);
    current.setHours(h1, m1, 0, 0);
    const end = new Date(date);
    end.setHours(h2, m2, 0, 0);

    const slots = [];
    while (current < end) {
      slots.push(current.toTimeString().slice(0,5));
      current.setMinutes(current.getMinutes() + weekly.slotDuration);
    }

    const booked = await Appointment.find({ doctorId, date }).select("time");
    const bookedTimes = booked.map(b => b.time);
    const avail = slots.filter(t => !bookedTimes.includes(t));

    res.json(avail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching slots" });
  }
});

module.exports = router;
