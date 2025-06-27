const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");

// Set availability
router.put("/availability/:uid", verifyToken, async (req, res) => {
    try {
      const updated = await User.findOneAndUpdate(
        { uid: req.params.uid },
        { $set: { availability: req.body.availability } },
        { new: true }
      );
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to set availability" });
    }
  });
  