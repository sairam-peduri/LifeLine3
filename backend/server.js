// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const admin = require("firebase-admin");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const User = require("./models/User");

dotenv.config();

// ✅ Firebase Admin Initialization
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://life-line-sol.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io);

// ✅ Middleware
app.use(cors({ origin: "https://life-line-sol.vercel.app", credentials: true }));
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/user", require("./routes/user"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/uploads", express.static("uploads"));
app.use("/api", require("./routes/prediction"));

const FLASK_API_URL = "https://lifeline3.onrender.com/api";

// ✅ Get Symptoms from Flask
app.get("/api/get_symptoms", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API_URL}/get_symptoms`);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Error fetching symptoms from Flask:", err.message);
    res.status(500).json({ message: "Error fetching symptoms" });
  }
});

const { verifyToken } = require("./middlewares/verifyToken");

app.post("/api/predict", verifyToken, async (req, res) => {
  try {
    const { symptoms } = req.body;
    const uid = req.user.uid;

    console.log("📥 Predict request by UID:", uid);
    console.log("💊 Symptoms:", symptoms);

    const flaskRes = await axios.post(`${FLASK_API_URL}/predict`, {
      symptoms,
      uid, // ✅ Send UID for fallback logging in Flask
    });

    const predictedDisease = flaskRes.data.disease;

    const updatedUser = await User.findOneAndUpdate(
      { uid },
      {
        $push: {
          predictionHistory: {
            symptoms,
            predictedDisease,
            predictedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      console.error("❌ No user found to update for uid:", uid);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ Prediction stored for:", updatedUser.email);
    return res.json({ disease: predictedDisease });
  } catch (err) {
    console.error("❌ Prediction failed:", err.message);
    return res.status(500).json({ message: "Prediction failed" });
  }
});

// ✅ Prediction History API (GET with pagination)
app.get("/api/predictions", async (req, res) => {
  const { uid, page = 1, limit = 10 } = req.query;
  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const total = user.predictionHistory.length;
    const start = (page - 1) * limit;
    const history = user.predictionHistory
      .slice()
      .reverse()
      .slice(start, start + parseInt(limit));

    res.json({ history, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete Prediction History Item
app.delete("/api/predictions/:uid/:entryId", async (req, res) => {
  const { uid, entryId } = req.params;
  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { $pull: { predictionHistory: { _id: entryId } } },
      { new: true }
    );
    res.json({ success: true, updatedHistory: user.predictionHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete entry" });
  }
});

// ✅ WebSocket Events
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`📦 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send-message", (msg) => {
    io.to(msg.roomId).emit("receive-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ✅ Root Route
app.get("/", (req, res) => res.send("✅ LifeLine Backend running..."));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on https://lifeline3-1.onrender.com`);
});
