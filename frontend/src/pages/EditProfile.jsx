import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EditProfile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    specialization: "",
    workplace: "",
    about: "",
    consultationFee: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        gender: user.gender || "",
        dob: user.dob || "",
        specialization: user.specialization || "",
        workplace: user.workplace || "",
        about: user.about || "",
        consultationFee: user.consultationFee || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://lifeline3-1.onrender.com/api/user/update/${user.uid}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated successfully");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {user.role === "doctor" && (
          <>
            <input name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Specialization" />
            <input name="workplace" value={formData.workplace} onChange={handleChange} placeholder="Workplace" />
            <textarea name="about" value={formData.about} onChange={handleChange} placeholder="About you..." />
            <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} placeholder="Consultation Fee" />
          </>
        )}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
