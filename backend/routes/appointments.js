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
    const conflict = await Appointment.findOne({ doctorId, date, time, status: { $in: ["pending", "accepted"] } });
    if (conflict) return res.status(409).json({ error: "Slot already booked" });

    const newAppointment = new Appointment({ patientId, doctorId, date, time, reason });
    await newAppointment.save();
    res.json(newAppointment);
  } catch (err) {
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

// GET available slots
router.get("/available", verifyToken, async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ error: "Missing parameters" });

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || !doctor.availability) return res.status(404).json({ error: "Doctor not found or no availability" });

    const weekday = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    if (!doctor.availability.days.includes(weekday)) return res.json([]);

    const { fromTime, toTime, slotDuration } = doctor.availability;

    const [fromH, fromM] = fromTime.split(":").map(Number);
    const [toH, toM] = toTime.split(":").map(Number);
    const start = new Date(date);
    start.setHours(fromH, fromM, 0, 0);
    const end = new Date(date);
    end.setHours(toH, toM, 0, 0);

    const slots = [];
    for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + slotDuration)) {
      slots.push(time.toTimeString().slice(0, 5)); // "HH:MM"
    }

    const booked = await Appointment.find({ doctorId, date }).select("time");
    const bookedTimes = booked.map((b) => b.time);
    const available = slots.filter((t) => !bookedTimes.includes(t));

    res.json(available);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching slots" });
  }
});

module.exports = router;
