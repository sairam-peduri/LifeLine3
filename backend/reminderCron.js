const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Appointment = require("./models/Appointment");
const User = require("./models/User");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Run every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  try {
    const now = new Date();
    const upperLimit = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes later

    // Fetch all accepted appointments for today not yet reminded
    const todayStr = now.toISOString().split("T")[0];
    const appointments = await Appointment.find({
      status: "accepted",
      date: todayStr,
      reminderSent: { $ne: true }
    });

    for (const appt of appointments) {
      const [hour, minute] = appt.time.split(":");
      const apptDate = new Date(`${appt.date}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`);

      if (apptDate > now && apptDate <= upperLimit) {
        const patient = await User.findById(appt.patientId);
        const doctor = await User.findById(appt.doctorId);

        if (patient?.email && doctor) {
          // Send email
          await transporter.sendMail({
            from: `"LifeLine App" <${process.env.EMAIL_USER}>`,
            to: patient.email,
            subject: "⏰ Appointment Reminder - LifeLine",
            text: `Hi ${patient.name},\n\nYou have an appointment with Dr. ${doctor.name} at ${appt.time} today.\n\nPlease be prepared.\n\nThanks,\nLifeLine Team`,
          });

          // Mark reminder as sent
          appt.reminderSent = true;
          await appt.save();
          console.log(`✅ Reminder sent to ${patient.email}`);
        }
      }
    }

    console.log("🔔 Cron job checked appointments at", now.toLocaleTimeString());
  } catch (err) {
    console.error("❌ Reminder cron error:", err.message);
  }
});
