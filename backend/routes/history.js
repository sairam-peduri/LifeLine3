const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");

router.get("/api/history", verifyToken, async (req, res) => {
    const email = req.query.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
  
    res.json({ history: user.predictionHistory || [] });
  });
  
module.exports = router;