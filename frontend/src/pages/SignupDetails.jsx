import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";

export default function SignupDetails() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [role, setRole] = useState("patient");

  // Doctor-only fields
  const [specialization, setSpecialization] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [about, setAbout] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = await auth.currentUser.getIdToken(true);
      const payload = {
        gender,
        dob,
        role,
      };

      if (role === "doctor") {
        payload.specialization = specialization;
        payload.workplace = workplace;
        payload.about = about;
        payload.consultationFee = consultationFee;
      }

      await axios.post(
        "http://localhost:5000/api/auth/complete-profile",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Complete Profile</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </div>

      <div>
        <label>Gender</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} required>
          <option value="">--Select--</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label>Date of Birth</label>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
      </div>

      {role === "doctor" && (
        <>
          <div>
            <label>Specialization</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Workplace</label>
            <input
              type="text"
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              required
            />
          </div>
          <div>
            <label>About You</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Consultation Fee (in SOL)</label>
            <input
              type="number"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
