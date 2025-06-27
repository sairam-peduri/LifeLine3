const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");

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

// Update user profile by UID
router.put("/update/:uid", verifyToken, async (req, res) => {
  const { uid } = req.params;
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



module.exports = router;

