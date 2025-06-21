const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  participants: [{ type: String }], // ✅ store both uids
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
}, { timestamps: true });

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
