import React, { useEffect, useRef, useState } from "react";
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
        { symptoms: selectedSymptoms.map((s) => s.value), userId: user._id },
        token
      );           
      console.log("Sending to prediction:", {
        symptoms: selectedSymptoms.map((s) => s.value),
        userId: user._id,
      });        
      if (disease) {
        setPrediction(disease);
        const res = await fetch("https://lifeline3.onrender.com/api/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ disease }),
        });
        const info = await res.json();
        setDetails(info?.details || (info?.summary ? { Summary: info.summary } : {}));
      } else {
        setError("No prediction. Try chat.");
        setChatbotSuggested(true);
      }
    } catch {
      setError("Prediction failed. Try again later.");
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = (text, sender) => ({ text, sender });

    setChatMessages((prev) => [...prev, msg(chatInput, "user")]);
    setIsChatLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const { response } = await chatWithBot({ message: chatInput }, token);
      setChatMessages((prev) => [
        ...prev,
        msg(response || "I didn't catch that.", "bot"),
      ]);
    } catch {
      setChatMessages((prev) => [...prev, msg("Error. Please try again.", "bot")]);
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

      <div className="dash-container">
        <h1>Health Prediction</h1>
        <Select
          options={symptomOptions}
          isMulti
          placeholder="Select symptoms..."
          onChange={(opts) => {
            setSelectedSymptoms(opts);
            setPrediction("");
            setError("");
            setChatbotSuggested(false);
          }}
          value={selectedSymptoms}
          styles={selectStyles}
        />
        <button className="btn-predict" onClick={handlePredict}>
          Predict
        </button>
        {error && <div className="error-msg">{error}</div>}
        {chatbotSuggested && <div className="hint">Try our chatbot!</div>}

        {prediction && (
          <div className="result-card">
            <div
              className="result-header"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span>Prediction: {prediction}</span>
              <span className={`arrow ${showDetails ? "open" : ""}`}>▼</span>
            </div>
            {showDetails && (
              <div className="result-details">
                {details && Object.entries(details).map(([k, v]) => (
                  <div key={k}>
                    <h4>{k}</h4>
                    {Array.isArray(v) ? (
                      <ul>
                        {v.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{v}</p>
                    )}
                  </div>
                ))}
                <p><strong>Note:</strong> See a doctor for a confirmed diagnosis.</p>
                <p>Prediction may be wrong, please contact doctor if required.</p>
              </div>
            )}
          </div>
        )}

        <Link to="/doctors" className="link-doctors">
          View Available Doctors →
        </Link>
      </div>

      {/* ✅ Floating Chatbot */}
      <div className="floating-chat-container">
        <button
          className="chat-toggle-button"
          onClick={() => setChatOpen(!chatOpen)}
        >
          💬
        </button>

        {chatOpen && (
          <div className="chat-box">
            <div className="chat-header">
              <span>HealthBot</span>
              <button onClick={() => setChatOpen(false)}>✖</button>
            </div>
            <div className="chat-messages" ref={chatRef}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              {isChatLoading && <div className="chat-message bot">Typing...</div>}
            </div>
            <form className="chat-input-area" onSubmit={handleChat}>
              <input
                type="text"
                placeholder="Ask your health question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
