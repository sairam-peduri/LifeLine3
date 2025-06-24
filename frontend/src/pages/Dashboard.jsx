import React, { useEffect, useRef, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { chatWithBot, getSymptoms, predictDisease } from "../api/api";
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
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState("");
  const [chatbotSuggested, setChatbotSuggested] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (!user) return navigate("/login");
    getSymptoms()
      .then(setSymptomOptions)
      .catch(() => setError("Could not load symptoms."));
  }, [user, navigate]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [chatMessages]);

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError("Select at least one symptom.");
      return;
    }
    setError("");
    setPrediction("");
    setDetails(null);
    setChatbotSuggested(false);

    try {
      const token = await firebaseUser.getIdToken();
      const { disease } = await predictDisease(
        { symptoms: selectedSymptoms.map(s => s.value), username: user.uid },
        token
      );
      if (disease) {
        setPrediction(disease);
        const res = await fetch("https://lifeline3.onrender.com/api/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ disease })
        });
        const info = await res.json();
        setDetails(info.details || { Summary: info.summary } || {});
      } else {
        setError("No prediction. Try chat.");
        setChatbotSuggested(true);
      }
    } catch {
      setError("Prediction failed. Try again later.");
    }
  };

  const handleChat = async e => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = text => ({ text, sender: text === chatInput ? "user" : "bot" });
    setChatMessages(prev => [...prev, msg(chatInput)]);
    setIsChatLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const { response } = await chatWithBot({ message: chatInput }, token);
      setChatMessages(prev => [...prev, msg(response || "I didn't catch that.")]);
    } catch {
      setChatMessages(prev => [...prev, msg("Error. Please try again.")]);
    } finally {
      setIsChatLoading(false);
      setChatInput("");
    }
  };

  if (!user) return <div className="loading-screen">Loading…</div>;

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#1e1e3f",
      borderColor: "#555",
      color: "#eee",
    }),
    input: (base) => ({ ...base, color: "#eee" }),
    singleValue: (base) => ({ ...base, color: "#eee" }),
    menu: (base) => ({ ...base, backgroundColor: "#1e1e3f", color: "#eee" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#333" : "#1e1e3f",
      color: "#eee",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#333",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#eee",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#bbb",
    }),
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="alert-bar">
        <FaExclamationTriangle />
        {(!user.name || !user.gender || !user.dob) ? (
          <span>
            Profile incomplete. <Link to="/profile">Complete now</Link>.
          </span>
        ) : null}
      </div>

      <div className="dash-container">
        <h1>Health Prediction</h1>
        <Select
          options={symptomOptions}
          isMulti
          placeholder="Select symptoms..."
          onChange={opts => {
            setSelectedSymptoms(opts);
            setPrediction("");
            setError("");
            setChatbotSuggested(false);
          }}
          value={selectedSymptoms}
          styles={selectStyles}
        />
        <button className="btn-predict" onClick={handlePredict}>Predict</button>
        {error && <div className="error-msg">{error}</div>}
        {chatbotSuggested && <div className="hint">Try our chatbot!</div>}

        {prediction && (
          <div className="result-card">
            <div className="result-header" onClick={() => setShowDetails(!showDetails)}>
              <span>Prediction: {prediction}</span>
              <span className={`arrow ${showDetails ? "open" : ""}`}>▼</span>
            </div>
            {showDetails && (
              <div className="result-details">
                {Object.entries(details).map(([k, v]) => (
                  <div key={k}>
                    <h4>{k}</h4>
                    {Array.isArray(v) ? <ul>{v.map((i, i2) => <li key={i2}>{i}</li>)}</ul> : <p>{v}</p>}
                  </div>
                ))}
                <p><strong>Note:</strong> See a doctor for a confirmed diagnosis.</p>
              </div>
            )}
          </div>
        )}

        <Link to="/doctors" className="link-doctors">View Available Doctors →</Link>

        <div className="chat-widget">
          <button className="btn-chat-toggle" onClick={() => setChatOpen(!chatOpen)}>
            {chatOpen ? 'Close Chat' : 'Chat with Us'}
          </button>
          {chatOpen && (
            <div className="chat-box">
              <div ref={chatRef} className="chat-messages">
                {chatMessages.length === 0 && <p>How can I assist?</p>}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`msg ${m.sender}`}>{m.text}</div>
                ))}
                {isChatLoading && <div className="msg bot">Typing…</div>}
              </div>
              <form onSubmit={handleChat}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Say something..."
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
