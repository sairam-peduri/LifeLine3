const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");

// GET all users or users by role
router.get("/", verifyToken, async (req, res) => {
  const role = req.query.role;
  try {
    const users = role
      ? await User.find({ role })
      : await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET user name/uid (for chat display)
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

// PUT - Update full user profile by UID
router.put("/update/:uid", verifyToken, async (req, res) => {
  const { uid } = req.params;

  // Optional: Only allow self-update
  if (req.user.uid !== uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const updated = await User.findOneAndUpdate(
      { uid },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// PUT - Update WEEKLY Availability
router.put("/:uid/availability", verifyToken, async (req, res) => {
  const { uid } = req.params;
  const { availability } = req.body;

  // 🔒 Ensure the logged-in user is updating their own availability
  if (req.user.uid !== uid) {
    return res.status(401).json({ error: "Unauthorized to update this availability" });
  }

  try {
    const updated = await User.findOneAndUpdate(
      { uid },
      { $set: { availability } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Availability updated", availability: updated.availability });
  } catch (err) {
    console.error("Error updating availability:", err);
    res.status(500).json({ error: "Server error updating availability" });
  }
});

module.exports = router;
