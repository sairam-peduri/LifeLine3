import React, { useEffect, useRef, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  chatWithBot,
  getSymptoms,
  predictDisease
} from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [symptomOptions, setSymptomOptions] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prediction, setPrediction] = useState("");
  const [details, setDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [error, setError] = useState("");
  const [chatbotSuggested, setChatbotSuggested] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const chatContainerRef = useRef(null);

  const isProfileIncomplete = user && (!user.name || !user.gender || !user.dob);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchInitialData = async () => {
      try {
        const symptoms = await getSymptoms();
        setSymptomOptions(symptoms);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch initial data.");
      }
    };

    fetchInitialData();
  }, [user, firebaseUser, navigate]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  const handleChange = (selectedOptions) => {
    setSelectedSymptoms(selectedOptions || []);
    setPrediction("");
    setDetails(null);
    setIsDetailsOpen(false);
    setError("");
    setChatbotSuggested(false);
  };

  const handlePredict = async () => {
    setPrediction("");
    setDetails(null);
    setError("");
    setIsDetailsOpen(false);
    setChatbotSuggested(false);

    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom.");
      return;
    }

    const symptomList = selectedSymptoms.map((s) => s.value);

    try {
      const token = await firebaseUser.getIdToken();
      const payload = {
        symptoms: symptomList,
        username: user?.uid || user?.email || "", 
      };

      const result = await predictDisease(payload, token);
      console.log("✅ Prediction result:", result);

      if (result.disease) {
        setPrediction(result.disease);
        fetchDetails(result.disease);
      } else {
        setError("Prediction failed. Try using the chatbot for better help.");
        setChatbotSuggested(true);
      }
    } catch (err) {
      console.error("❌ Prediction error:", err);
      setError("Prediction error. Try again later.");
    }
  };

  const fetchDetails = async (disease) => {
    try {
      const res = await fetch("https://lifeline3-1.onrender.com/api/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disease }),
      });

      const data = await res.json();

      if (data.details) {
        setDetails(data.details);
      } else if (data.summary) {
        setDetails({ Summary: data.summary });
      } else {
        setDetails(null);
      }
    } catch (err) {
      console.error("Failed to fetch disease details:", err);
      setDetails(null);
    }
  };

  const toggleDetails = () => setIsDetailsOpen(!isDetailsOpen);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, sender: "user" };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await chatWithBot({ message: chatInput }, token);

      const replyText =
        typeof response?.response === "string" && response.response.trim()
          ? response.response
          : "Sorry, I couldn’t understand that. Please rephrase.";

      const botMessage = { text: replyText, sender: "bot" };
      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        { text: "Sorry, I couldn’t respond!", sender: "bot" },
      ]);
    } finally {
      setIsChatLoading(false);
      setChatInput("");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <Navbar user={user} />
      <h2>Welcome to the Dashboard, {user.name || "User"}!</h2>

      {isProfileIncomplete && (
        <div className="profile-warning-banner">
          <div className="warning-content">
            <FaExclamationTriangle />
            <span>
              <strong>Profile Incomplete:</strong> Please complete your profile for better recommendations.
            </span>
          </div>
          <button onClick={() => navigate("/profile")} className="complete-now-btn">
            Complete Now
          </button>
        </div>
      )}

      <div className="dashboard-container">
        <h2>Health Prediction Dashboard</h2>
        <Select
          options={symptomOptions}
          isMulti
          onChange={handleChange}
          placeholder="Type to search symptoms..."
          value={selectedSymptoms}
        />

        <button onClick={handlePredict} className="predict-button">
          Predict
        </button>

        <div className="details-section">
          <small><strong><p style={{ color: "red" }}>Note:</p></strong></small>
          <p>
            <small>
              If symptoms are not in the list, use the Chatbot. This is just a prediction. Please visit a doctor for emergencies.
            </small>
            <Link to="/doctors">
                <button style={{ marginTop: "20px" }}>View Available Doctors</button>
            </Link>
          </p>
        </div>

        {error && <p className="error">{error}</p>}

        {prediction && (
          <div className="prediction-container">
            <div className="prediction-header" onClick={toggleDetails}>
              <strong>Predicted Disease:</strong> {prediction}
              <span className={`dropdown-arrow ${isDetailsOpen ? "open" : ""}`}>▼</span>
            </div>
            {details && isDetailsOpen ? (
              <div className="details-dropdown">
                {Object.entries(details).map(([heading, content], index) => (
                  <div key={index}>
                    <h4>{heading}</h4>
                    {Array.isArray(content) ? (
                      <ul>{content.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    ) : (
                      <p>{content}</p>
                    )}
                  </div>
                ))}
                <p><strong>Note:</strong> Please consult a doctor for accurate diagnosis.</p>
              </div>
            ) : (
              isDetailsOpen && <div className="details-dropdown"><p>Loading details...</p></div>
            )}
          </div>
        )}

        {chatbotSuggested && (
          <p className="chatbot-suggestion">
            <strong>Suggestion:</strong> Please use the chatbot for further assistance.
          </p>
        )}

        <div className="chatbot-container">
          <button className="chatbot-toggle" onClick={() => setChatOpen(!chatOpen)}>
            {chatOpen ? "Close Chat" : "Chat with Us"}
          </button>
          {chatOpen && (
            <div className="chatbot-window">
              <div className="chat-messages" ref={chatContainerRef}>
                {chatMessages.length === 0 && (
                  <p>Hi! Ask me anything about your symptoms or health concerns.</p>
                )}
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.sender}`}>
                    <span>{msg.text}</span>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="chat-message bot">
                    <span className="typing-animation">Typing...</span>
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="chat-input-form">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isChatLoading}
                />
                <button type="submit" disabled={isChatLoading}>Send</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
