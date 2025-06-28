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

// 4. Get available slots for a doctor on a selected date
router.get("/available", verifyToken, async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: "doctorId and date are required" });
  }

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || !doctor.availability) {
      return res.status(404).json({ error: "Doctor not found or availability not set" });
    }

    const { days, fromTime, toTime, slotDuration } = doctor.availability;
    const dayName = moment(date).format("dddd"); // e.g. "Monday"

    if (!days.includes(dayName)) {
      return res.json([]); // Doctor not available on this day
    }

    const from = moment(`${date} ${fromTime}`, "YYYY-MM-DD HH:mm");
    const to = moment(`${date} ${toTime}`, "YYYY-MM-DD HH:mm");
    const duration = slotDuration || 30;

    const allSlots = [];
    let current = from.clone();
    while (current.isBefore(to)) {
      allSlots.push(current.format("HH:mm"));
      current.add(duration, "minutes");
    }

    const bookedAppointments = await Appointment.find({ doctorId, date, status: { $in: ["pending", "accepted"] } });
    const bookedTimes = bookedAppointments.map(app => app.time);

    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
    res.json(availableSlots);
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
});

module.exports = router;
