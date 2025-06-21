const admin = require("firebase-admin");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decoded.uid });
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    console.log("📥 Incoming Authorization:", req.headers.authorization);
    console.log("🔓 Decoded UID:", decoded.uid);


    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { verifyToken };
