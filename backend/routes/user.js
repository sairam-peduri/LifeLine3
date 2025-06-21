const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");

// Get user details by UID (for chat display)
router.get("/:uid", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid }).select("name uid");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
