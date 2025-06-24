import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import "./DoctorProfile.css";

const DoctorProfile = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await axios.get(`${BACKEND_URL}/api/doctors/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(res.data.doctor);
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
      }
    };
    if (firebaseUser && uid) load();
  }, [firebaseUser, uid]);

  const startChat = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      await axios.post(
        `${BACKEND_URL}/api/chat/room`,
        { doctorId: uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/chat/${uid}`);
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  if (!doctor) return <div className="loading-doctor">Loading doctor profile...</div>;

  return (
    <div className="doctor-profile-wrapper">
      <Navbar user={user} />
      <div className="doctor-profile-card">
        <h2 className="doctor-name">{doctor.name}</h2>
        <p><strong>Specialization:</strong> {doctor.specialization}</p>
        <p><strong>Workplace:</strong> {doctor.workplace}</p>
        <p><strong>Consultation Fee:</strong> {doctor.consultationFee} SOL</p>
        <div className="doctor-buttons">
          <button className="chat-btn" onClick={startChat}>💬 Chat</button>
          <button className="pay-btn" onClick={() => navigate(`/pay/${doctor.uid}`)}>
            💰 Pay Consultation Fee
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
