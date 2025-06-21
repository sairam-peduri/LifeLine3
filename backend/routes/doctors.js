const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");

// GET /api/doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "uid name specialization about workplace consultationFee"
    );
    res.status(200).json({ doctors });
  } catch (err) {
    console.error("Fetch doctors error:", err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// GET /api/doctors/:uid
router.get("/:uid", verifyToken, async (req, res) => {
  try {
    const doctor = await User.findOne({ uid: req.params.uid, role: "doctor" });
    console.log("Fetching doctor by UID:", req.params.uid);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json({ doctor });
  } catch (err) {
    console.error("Error fetching doctor:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
