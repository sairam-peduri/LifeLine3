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

  if (!doctorId || !date) {
    return res.status(400).json({ error: "Missing doctorId or date" });
  }

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Get weekly availability
    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "long"
    });

    const weekly = doctor.availability?.weekly || {};
    if (!weekly.days?.includes(dayOfWeek)) {
      return res.json([]); // No availability on this day
    }

    const [fromHour, fromMin] = weekly.fromTime.split(":").map(Number);
    const [toHour, toMin] = weekly.toTime.split(":").map(Number);
    const slotDuration = weekly.slotDuration || 30;

    const start = new Date(`${date}T${weekly.fromTime}`);
    const end = new Date(`${date}T${weekly.toTime}`);
    const slots = [];

    for (
      let time = new Date(start);
      time < end;
      time.setMinutes(time.getMinutes() + slotDuration)
    ) {
      const t = time.toTimeString().slice(0, 5); // e.g., "10:30"
      slots.push(t);
    }

    // Filter out already booked slots
    const existing = await Appointment.find({
      doctorId,
      date,
    }).select("time");

    const bookedTimes = existing.map((a) => a.time);
    const availableSlots = slots.filter((t) => !bookedTimes.includes(t));

    res.json(availableSlots);
  } catch (err) {
    console.error("Failed to fetch slots:", err);
    res.status(500).json({ error: "Server error fetching slots" });
  }
});

module.exports = router;