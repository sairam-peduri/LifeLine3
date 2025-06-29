import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./DoctorDirectory.css";

const DoctorDirectory = () => {
  const { user, firebaseUser } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = await firebaseUser.getIdToken(true);
        const res = await axios.get("https://lifeline3-1.onrender.com/api/doctors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data.doctors || []);
        setFiltered(res.data.doctors || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, [firebaseUser]);

  useEffect(() => {
    const searchLower = search.toLowerCase();
    const filteredDocs = doctors.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchLower) ||
        doc.specialization.toLowerCase().includes(searchLower)
    );
    setFiltered(filteredDocs);
  }, [search, doctors]);

  return (
    <div className="doctor-directory-wrapper">
      <Navbar user={user} />
      <div style={{ marginTop: "40px" }} className="doctor-directory">
        <h2>🩺 Doctor Directory</h2>

        <input
          className="doctor-search"
          type="text"
          placeholder="Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="doctor-cards">
          {filtered.length === 0 ? (
            <p className="no-doctors">No matching doctors found.</p>
          ) : (
            filtered.map((doc) => (
              <div key={doc._id} className="doctor-card">
                <h3>{doc.name}</h3>
                <p><strong>Specialization:</strong> {doc.specialization}</p>
                <p><strong>Workplace:</strong> {doc.workplace}</p>
                <p><strong>Fee:</strong> {doc.consultationFee} SOL</p>
                <Link to={`/doctor/${doc.uid}`}>
                  <button className="view-btn">View Profile</button>
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
