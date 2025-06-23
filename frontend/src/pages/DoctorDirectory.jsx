
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const DoctorDirectory = () => {
  const { user, firebaseUser } = useAuth();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = await firebaseUser.getIdToken(true);
        const res = await axios.get("http://lifeline3-1.onrender.com/api/doctors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data.doctors || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, [firebaseUser]);

  return (
    <div>
    <Navbar user={user} />
    <div style={{ padding: "20px" }}>
      <h2>Doctor Directory</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {doctors.length === 0 ? (
          <p>No doctors available.</p>
        ) : (
          doctors.map((doc) => (
            <div
              key={doc._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                width: "250px",
                background: "#f9f9f9",
              }}
            >
              <h3>{doc.name}</h3>
              <p><strong>Specialization:</strong> {doc.specialization}</p>
              <p><strong>Workplace:</strong> {doc.workplace}</p>
              <p><strong>Fee:</strong> ₹{doc.consultationFee}</p>
              <Link to={`/doctor/${doc.uid}`}>
                <button style={{ marginTop: "10px" }}>View Profile</button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
};

export default DoctorDirectory;
