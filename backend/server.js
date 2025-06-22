const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const admin = require("firebase-admin");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// 🔐 Firebase Admin Setup
const serviceAccount = require("./firebaseServiceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

dotenv.config();
const app = express();
const server = http.createServer(app);

// 🔌 Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174", // Replace with your frontend port
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io); // So you can access it in routes

// 🌐 Middleware
app.use(cors({ origin: "http://localhost:5174", credentials: true }));
app.use(express.json());

// 🌍 MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 📦 Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/user", require("./routes/user"));
app.use("/api/chat", require("./routes/chat")); // ✅ Chat routes
app.use("/uploads", express.static("uploads"));
app.use("/api/transactions", require("./routes/transactions"));


// 🧠 ML Proxy Routes
const FLASK_API_URL = "http://localhost:5001/api";

app.get("/api/get_symptoms", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API_URL}/get_symptoms`);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Error fetching symptoms from Flask:", err.message);
    res.status(500).json({ message: "Error fetching symptoms" });
  }
});

app.post("/api/predict", async (req, res) => {
  try {
    const { symptoms } = req.body;
    const response = await axios.post(`${FLASK_API_URL}/predict`, { symptoms });
    res.json(response.data);
  } catch (err) {
    console.error("❌ Prediction failed:", err.message);
    res.status(500).json({ message: "Prediction failed" });
  }
});

// 💬 Real-time Chat (Socket.io)
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

// 🩺 Health Check
app.get("/", (req, res) => res.send("✅ LifeLine Backend running..."));

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
