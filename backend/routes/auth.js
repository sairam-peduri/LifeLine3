const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Gmail welcome email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.uid = decoded.uid;
    req.email = decoded.email;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(400).json({ error: 'Invalid token' });
  }
};

router.post('/login', verifyToken, async (req, res) => {
  try {
    const { name, email, uid } = req.body;
    if (!name || !email || !uid) 
      return res.status(400).json({ error: 'Missing fields' });

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        uid, name, email, role: 'patient',
        isProfileComplete: false,
      });
      await user.save();
      await transporter.sendMail({
        from: `"LifeLine" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Welcome to LifeLine',
        text: `Hi ${name}, welcome to LifeLine!`,
      });
    }

    res.status(200).json({
      isNewUser: !user.isProfileComplete,
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    console.error('/me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/complete-profile', verifyToken, async (req, res) => {
  try {
    const { gender, dob, role, specialization, about, workplace, consultationFee } = req.body;
    if (!gender || !dob || !role)
      return res.status(400).json({ error: 'Gender, DOB, and Role required' });

    const user = await User.findOne({ email: req.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.gender = gender;
    user.dob = dob;
    user.role = role;
    user.isProfileComplete = true;

    if (role === "doctor") {
      if (!specialization || !about || !workplace || !consultationFee)
        return res.status(400).json({ error: 'All doctor fields required' });

      user.specialization = specialization;
      user.about = about;
      user.workplace = workplace;
      user.consultationFee = consultationFee;
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Complete-profile error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ name: user.name });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.put("/wallet", verifyToken, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const uid = req.uid; 

    if (!walletAddress) {
      return res.status(400).json({ error: "Missing wallet address" });
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { walletAddress },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Wallet updated", user });
  } catch (err) {
    console.error("Wallet update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
