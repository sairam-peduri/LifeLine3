const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const admin = require("firebase-admin");

// Middleware: Verifies Firebase token and sets req.uid + req.email
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const idToken = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.uid = decoded.uid;
    req.email = decoded.email;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(400).json({ error: "Invalid token" });
  }
};

// POST /api/transactions/send
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { receiverId, amount, txId } = req.body;

    if (!receiverId || !amount || !txId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sender = await User.findOne({ uid: req.uid });
    const receiver = await User.findOne({ uid: receiverId });

    if (!sender || !receiver) {
      return res.status(404).json({ error: "Sender or receiver not found" });
    }

    const transaction = new Transaction({
      senderId: sender.uid,
      receiverId: receiver.uid,
      senderName: sender.name,
      receiverName: receiver.name,
      senderWallet: sender.walletAddress,
      receiverWallet: receiver.walletAddress,
      amount,
      txId,
    });

    await transaction.save();
    res.status(201).json({ message: "Transaction recorded", transaction });
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({ error: "Failed to record transaction" });
  }
});

// GET /api/transactions/history
router.get("/history", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;

    const transactions = await Transaction.find({
      $or: [{ senderId: uid }, { receiverId: uid }],
    }).sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});

module.exports = router;
