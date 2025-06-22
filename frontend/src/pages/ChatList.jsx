// src/pages/ChatList.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import "./ChatList.css"; // 💡 Custom CSS for better style

const ChatList = () => {
  const { user, firebaseUser } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [userMap, setUserMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await axios.get(`${BACKEND_URL}/api/chat/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sorted = res.data.rooms.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setRooms(sorted);

        const otherUserIds = sorted
          .map(room => [room.patientId, room.doctorId].find(id => id !== firebaseUser.uid))
          .filter(Boolean);

        const uniqueIds = [...new Set(otherUserIds)];

        const fetchedMap = {};
        await Promise.all(
          uniqueIds.map(async (uid) => {
            const res = await axios.get(`${BACKEND_URL}/api/user/${uid}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchedMap[uid] = res.data.user.name;
          })
        );

        setUserMap(fetchedMap);
      } catch (err) {
        console.error("Error loading chat rooms:", err);
      }
    };

    if (firebaseUser) load();
  }, [firebaseUser]);

  const goToChat = (room) => {
    const otherId = [room.patientId, room.doctorId].find(id => id !== firebaseUser.uid);
    navigate(`/chat/${otherId}`);
  };

  return (
    <div>
      <Navbar user={user} />
      <div className="chat-list-wrapper">
        <h2 className="chat-list-title">💬 Your Conversations</h2>
        {rooms.map((room) => {
          const last = room.messages.at(-1);
          const otherId = [room.patientId, room.doctorId].find(id => id !== firebaseUser.uid);
          const otherName = userMap[otherId] || "Unknown";

          return (
            <div key={room.roomId} className="chat-room-item" onClick={() => goToChat(room)}>
              <div className="chat-name">{otherName}</div>
              <div className="chat-preview">{last?.text || <i>No messages yet</i>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
