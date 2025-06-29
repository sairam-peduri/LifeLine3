const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { verifyToken } = require("../middlewares/auth");

// Book Appointment
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
    res.status(500).json({ error: "Booking failed" });
  }
});

// Get appointments by user
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

// Update appointment status & notify
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
    ).populate("patientId");

    if (!updated) return res.status(404).json({ error: "Appointment not found" });

    const msg = `Your appointment on ${updated.date} at ${updated.time} has been ${status}.`;

    await Notification.create({
      userId: updated.patientId._id,
      message: msg,
    });

    // Emit real-time notification if socket is connected
    if (req.io) {
      req.io.to(updated.patientId._id.toString()).emit("new_notification", msg);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Available slots
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
    if (!weekly || !weekly.fromTime || !weekly.toTime || !Array.isArray(weekly.days)) {
      return res.json([]);
    }

    const validDate = new Date(date + "T00:00:00");
    const weekday = validDate.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });

    if (!weekly.days.includes(weekday)) return res.json([]);

    const slotDuration = parseInt(weekly.slotDuration) || 30;
    const start = new Date(`${date}T${weekly.fromTime}`);
    const end = new Date(`${date}T${weekly.toTime}`);
    const slots = [];

    for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes() + slotDuration)) {
      const slotTime = t.toTimeString().slice(0, 5);
      slots.push(slotTime);
    }

    const booked = await Appointment.find({ doctorId, date }).select("time");
    const bookedTimes = booked.map((b) => b.time);
    const available = slots.filter((t) => !bookedTimes.includes(t));

    res.json(available);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching slots" });
  }
});

module.exports = router;
