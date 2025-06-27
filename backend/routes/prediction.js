const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const User = require("../models/User");

// ✅ GET /api/history/:id
router.get("/history/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ history: user.predictionHistory || [] });
  } catch (err) {
    console.error("❌ Error fetching history:", err.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;
