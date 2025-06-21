const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const User = require("../models/User");

// ✅ Create or return existing chat room
router.post("/room", verifyToken, async (req, res) => {
  const doctorId = req.body.doctorId; // uid of doctor
  const patientId = req.user.uid;

  if (!doctorId || doctorId === patientId) {
    return res.status(400).json({ error: "Invalid doctor ID" });
  }

  const sortedUIDs = [doctorId, patientId].sort();
  const roomId = sortedUIDs.join("_");

  let room = await ChatRoom.findOne({ roomId });

  if (!room) {
    room = new ChatRoom({
      roomId,
      doctorId,
      patientId,
      participants: [doctorId, patientId],
      messages: [],
    });
    await room.save();

    // Add room to both doctor and patient chatRooms
    await User.updateOne({ uid: doctorId }, { $addToSet: { chatRooms: roomId } });
    await User.updateOne({ uid: patientId }, { $addToSet: { chatRooms: roomId } });
  }

  res.json({ roomId });
});

// ✅ Send a new message
router.post("/message", verifyToken, async (req, res) => {
  const { roomId, text } = req.body;

  const room = await ChatRoom.findOne({ roomId });
  if (!room || ![room.patientId, room.doctorId].includes(req.user.uid)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const message = new Message({
    roomId,
    senderId: req.user.uid,
    senderName: req.user.name,
    text,
  });

  await message.save();

  room.messages.push(message._id);
  await room.save();

  res.json({ message });
});

// ✅ Get all messages for a room
router.get("/messages/:roomId", verifyToken, async (req, res) => {
  const { roomId } = req.params;

  const room = await ChatRoom.findOne({ roomId }).populate("messages");
  if (!room || ![room.patientId, room.doctorId].includes(req.user.uid)) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json({ messages: room.messages });
});

// ✅ Fetch all rooms a user is in
router.get("/rooms", verifyToken, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user || !user.chatRooms || user.chatRooms.length === 0) {
    return res.json({ rooms: [] });
  }

  const rooms = await ChatRoom.find({ roomId: { $in: user.chatRooms } }).populate("messages");

  // Fetch and attach the other user’s name
  const roomData = await Promise.all(
    rooms.map(async (room) => {
      const otherUid = [room.patientId, room.doctorId].find(id => id !== req.user.uid);
      const otherUser = await User.findOne({ uid: otherUid });

      return {
        ...room.toObject(),
        otherUserName: otherUser?.name || "Unknown",
      };
    })
  );

  res.json({ rooms: roomData });
});

module.exports = router;
