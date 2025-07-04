const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["patient", "doctor"], default: "patient" },
  gender: String,
  dob: String,
  walletAddress: { type: String, default: null },
  tier: { type: String, enum: ["free", "advanced", "prime"], default: "free" },

  predictionHistory: {
    type: [
      {
        symptoms: [String],
        predictedDisease: String,
        predictedAt: { type: Date, default: Date.now },
      }
    ],
    default: [],
  },

  availability: {
    weekly: {
      days: [String],          // e.g. ["Monday", "Wednesday"]
      fromTime: String,        // e.g. "10:00"
      toTime: String,          // e.g. "13:00"
      slotDuration: { type: Number, default: 30 } // in minutes
    }
  },incentives: [
    {
      type: {
        type: String, // "patient" or "doctor"
        enum: ["patient", "doctor"]
      },
      appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
      amount: Number,
      txId: String,
      receivedAt: { type: Date, default: Date.now }
    }
  ],  

  healthRecords: [
    {
      filename: String,
      fileUrl: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],

  chatRooms: [{ type: String }],
  isProfileComplete: { type: Boolean, default: false },
  specialization: String,
  workplace: String,
  about: String,
  consultationFee: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
