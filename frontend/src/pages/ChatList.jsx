// src/pages/ChatList.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/AuthContext";

const ChatList = () => {
  const { user,firebaseUser } = useAuth();
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

        // Get all other user IDs in the chat
        const otherUserIds = sorted
          .map(room => [room.patientId, room.doctorId].find(id => id !== firebaseUser.uid))
          .filter(Boolean);

        // Remove duplicates
        const uniqueIds = [...new Set(otherUserIds)];

        // Fetch their details in parallel
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
    <div style={{ padding: 20 }}>
      <h2>Your Conversations</h2>
      {rooms.map((room) => {
        const last = room.messages.at(-1);
        const otherId = [room.patientId, room.doctorId].find(id => id !== firebaseUser.uid);
        const otherName = userMap[otherId] || "Unknown";

        return (
          <div
            key={room.roomId}
            style={{
              border: "1px solid gray",
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
            }}
            onClick={() => goToChat(room)}
          >
            <strong>{otherName}</strong>
            <p style={{ margin: 4 }}>{last?.text || "No messages yet"}</p>
          </div>
        );
      })}
    </div>
    </div>
  );
};

export default ChatList;
