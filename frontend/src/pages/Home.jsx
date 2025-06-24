import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <Navbar />
      <section className="hero">
        <h1>AI-Powered Personal Health Dashboard</h1>
        <p>Your smart companion for disease prediction and prevention</p>
        <p>
          Revolutionize your health with our AI-powered personal health dashboard.
          Get real-time insights, predict diseases, and receive preventive tips for a healthier life.
        </p>
        <button onClick={() => navigate("/login")}>Login / Signup</button>
      </section>

      <section className="intro">
        <h2>🩺 LifeLine: Decentralized Health Consultation Platform</h2>
        <p>
          LifeLine is a Web3-powered health consultation platform enabling patients to connect with verified doctors, get AI-driven disease predictions based on symptoms, and pay for services using Solana (SOL) through Phantom Wallet.
        </p>
        <div className="buttons">
          <a href="#demo">🎥 Demo</a>
          <a href="https://life-line3.vercel.app" target="_blank">🌐 Live App</a>
        </div>
      </section>

      <section className="overview">
        <h2>🧠 Overview</h2>
        <p>
          Healthcare is evolving rapidly, and so should its digital presence. LifeLine offers a secure, decentralized, and intelligent solution to common health tech challenges by combining:
        </p>
        <ul>
          <li>🔐 Firebase-based authentication</li>
          <li>🩻 ML-based disease prediction</li>
          <li>💬 Real-time doctor-patient chat (Socket.IO)</li>
          <li>💸 Crypto payments with Phantom Wallet</li>
          <li>📦 Tiered access (Free, Advanced, Prime)</li>
        </ul>
      </section>

      <section className="features">
        <h2>✨ Platform Features</h2>
        <div className="feature-grid">
          <div className="feature-block">
            <h3>🧑‍⚕️ Patient Experience</h3>
            <ul>
              <li>Symptom-based disease prediction (ML)</li>
              <li>Chat with doctors in real-time</li>
              <li>View doctor profiles & consultation fees</li>
              <li>Pay with SOL through Phantom Wallet</li>
              <li>Store and access health reports securely</li>
            </ul>
          </div>
          <div className="feature-block">
            <h3>🩺 Doctor Experience</h3>
            <ul>
              <li>Register with specialization and bio</li>
              <li>Set consultation fees and availability</li>
              <li>Engage in patient chat rooms</li>
              <li>Receive payments in crypto</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="auth-wallet">
        <h2>🔐 Authentication & Wallet Integration</h2>
        <ul>
          <li>Firebase Gmail OAuth with welcome emails</li>
          <li>Solana wallet connection (Phantom)</li>
          <li>Tier-based access with secured routes</li>
        </ul>
      </section>

      <section className="backend-arch">
        <h2>⚙️ Backend & Data</h2>
        <ul>
          <li>MongoDB for storing users, chats, and prediction history</li>
          <li>Disease prediction using Python-based ML model</li>
          <li>Real-time messaging with Socket.IO</li>
          <li>RESTful API endpoints for health operations</li>
        </ul>
      </section>

      <section className="architecture">
        <h2>🏗️ Architecture</h2>
        <div className="arch-block">
          <h4>Apps</h4>
          <ul>
            <li><strong>Frontend:</strong> React + Firebase Auth + Phantom Wallet Adapter (Vercel)</li>
            <li><strong>Backend:</strong> Node.js + Express (Render)</li>
            <li><strong>ML Server:</strong> Python Flask (Render)</li>
          </ul>
          <h4>Services</h4>
          <ul>
            <li>/api/auth: Firebase token validation</li>
            <li>/api/predict: Predict disease from symptoms</li>
            <li>/api/details: Fetch disease information</li>
            <li>/api/chat: Live messaging backend</li>
            <li>/api/payment: Solana payment integration</li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
