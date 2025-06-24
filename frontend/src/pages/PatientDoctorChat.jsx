import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import ChatBubble from "../components/ChatBubble";
import Navbar from "../components/Navbar";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import "./PatientDoctorChat.css";

const socket = io(BACKEND_URL);

const PatientDoctorChat = () => {
  const { doctorId } = useParams();
  const { firebaseUser, user } = useAuth();
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!firebaseUser || !doctorId) return;

    const loadChat = async () => {
      const token = await firebaseUser.getIdToken();
      const res = await axios.post(`${BACKEND_URL}/api/chat/room`, { doctorId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRoomId(res.data.roomId);
      socket.emit("join-room", res.data.roomId);

      const msgs = await axios.get(`${BACKEND_URL}/api/chat/messages/${res.data.roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(msgs.data.messages);
    };

    loadChat();
  }, [firebaseUser, doctorId]);

  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("receive-message");
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const token = await firebaseUser.getIdToken();
    const res = await axios.post(`${BACKEND_URL}/api/chat/message`, { roomId, text }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    socket.emit("send-message", { roomId, message: res.data.message });
    setMessages((prev) => [...prev, res.data.message]);
    setText("");
  };

  return (
    <div className="chat-container">
      <Navbar user={user} />

      <div className="chat-body">
        <div className="chat-header">
          <h2>💬 Live Chat</h2>
          <button className="pay-button" onClick={() => navigate(`/pay/${doctorId}`)}>
            💰 Pay Consultation Fee
          </button>
        </div>

        <div className="chat-box">
          {messages.map((m, i) => (
            <ChatBubble
              key={i}
              senderName={m.senderName}
              text={m.text}
              mine={m.senderId === firebaseUser.uid}
            />
          ))}
        </div>

        <div className="chat-input-area">
          <input
            className="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
          />
          <button className="send-button" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default PatientDoctorChat;
