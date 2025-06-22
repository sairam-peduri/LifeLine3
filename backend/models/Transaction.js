const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  senderName: String,
  receiverName: String,
  senderWallet: String,
  receiverWallet: String,
  amount: Number,
  txId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
