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
