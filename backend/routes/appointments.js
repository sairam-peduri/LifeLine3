const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { verifyToken } = require("../middlewares/auth");
const { sendIncentive } = require("../utils/transferSol"); // ✅ SOL incentive

// ✅ Book Appointment
router.post("/", verifyToken, async (req, res) => {
  const { patientId, doctorId, date, time, reason } = req.body;

  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const exists = await Appointment.findOne({ doctorId, date, time });
    if (exists) return res.status(400).json({ error: "Slot already booked" });

    const appointment = new Appointment({ patientId, doctorId, date, time, reason });
    await appointment.save();

    res.json({ message: "Appointment booked", appointment });
  } catch (err) {
    console.error("❌ Booking error:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

// ✅ Get Appointments by User
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
    console.error("❌ Fetch appointments error:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// ✅ Update Appointment Status + Notify + Send SOL Incentive
router.put("/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;
  console.log("📥 Status update request received:", req.params.id, status);

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("patientId doctorId");

    if (!appointment) {
      console.error("❌ Appointment not found");
      return res.status(404).json({ error: "Appointment not found" });
    }

    console.log("🩺 Appointment updated. Notifying patient...");

    const msg = `Your appointment with Dr. ${appointment.doctorId.name} on ${appointment.date} at ${appointment.time} has been ${status.toUpperCase()}.`;

    await Notification.create({
      userId: appointment.patientId._id,
      message: msg,
    });

    if (req.io) {
      req.io.to(appointment.patientId._id.toString()).emit("new_notification", msg);
    }

    // ✅ Send incentive if accepted
    if (status === "accepted") {
      try {
        console.log("💸 Preparing to send SOL incentives...");

        const doctorWallet = appointment.doctorId.walletAddress;
        const patientWallet = appointment.patientId.walletAddress;
        const solAmount = 0.01;

        console.log("👨‍⚕️ Doctor Wallet:", doctorWallet);
        console.log("🧑 Patient Wallet:", patientWallet);

        if (!doctorWallet || !patientWallet) {
          console.warn("⚠️ Missing wallet addresses.");
        } else {
          const txDoctor = await sendIncentive(doctorWallet, solAmount);
          const txPatient = await sendIncentive(patientWallet, solAmount);

          console.log("✅ SOL sent to Doctor:", txDoctor);
          console.log("✅ SOL sent to Patient:", txPatient);

          // Optional: Save transaction IDs to appointment record
          appointment.incentiveTx = {
            doctorTx: txDoctor,
            patientTx: txPatient,
          };
          await appointment.save();
        }
      } catch (err) {
        console.error("❌ Error sending SOL:", err.message);
      }
    }

    res.json(appointment);
  } catch (err) {
    console.error("❌ Status update failed:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});


// ✅ Get Available Slots
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

    const selectedDate = new Date(`${date}T00:00:00`);
    const weekday = selectedDate.toLocaleDateString("en-US", {
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
    const availableSlots = slots.filter((t) => !bookedTimes.includes(t));

    res.json(availableSlots);
  } catch (err) {
    console.error("❌ Error fetching available slots:", err);
    res.status(500).json({ error: "Server error fetching slots" });
  }
});

module.exports = router;
