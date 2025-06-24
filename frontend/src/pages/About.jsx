import React, { useEffect } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./About.css";
import "./Reveal.css";

const About = () => {
  useEffect(() => {
    const revealOnScroll = () => {
      document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
          el.classList.add("active");
        }
      });
    };
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();
    return () => window.removeEventListener("scroll", revealOnScroll);
  }, []);

  return (
    <div className="about-page">
      <Navbar />
      <section className="hero-section reveal">
        <h1 className="hero-title">💡 About LifeLine</h1>
        <p className="hero-subtitle">
          Empowering preventive healthcare with Web3, AI, and real-time doctor access.
        </p>
      </section>

      <section className="about-section reveal">
        <h2>🌐 What is LifeLine?</h2>
        <p>
          <strong>LifeLine</strong> is an intelligent Web3-powered telehealth platform built to democratize healthcare
          access. It combines early disease prediction, direct doctor-patient chat, and seamless wallet payments—powered by Solana.
        </p>
      </section>

      <section className="feature-section reveal">
        <h2>🚀 Why LifeLine Stands Out</h2>
        <div className="feature-grid">
          <div className="feature-box">
            <h3>🔍 AI Disease Detection</h3>
            <p>Get real-time predictions based on your symptoms using ML-powered models.</p>
          </div>
          <div className="feature-box">
            <h3>👨‍⚕️ Doctor Directory</h3>
            <p>Find verified doctors by specialization and start chatting instantly.</p>
          </div>
          <div className="feature-box">
            <h3>💬 Private Chat</h3>
            <p>Talk with doctors directly in a secure, real-time chat room.</p>
          </div>
          <div className="feature-box">
            <h3>💳 Crypto Payments</h3>
            <p>Pay consultation fees securely in SOL via your Phantom wallet.</p>
          </div>
          <div className="feature-box">
            <h3>🧾 Prediction History</h3>
            <p>Track past diagnoses and symptoms with interactive visual insights.</p>
          </div>
          <div className="feature-box">
            <h3>🧊 Decentralized Storage</h3>
            <p>Coming soon: Store your medical records on-chain with Winter SDK.</p>
          </div>
        </div>
      </section>

      <section className="reveal impact-section">
        <h2>🎯 Our Mission</h2>
        <p>
          LifeLine exists to make healthcare **borderless, efficient, and decentralized**.
          Whether you're a patient in need or a doctor wanting to help, our platform ensures
          privacy, ease-of-access, and instant interaction—powered by next-gen tech.
        </p>
      </section>

      <section className="reveal about-cta">
        <h2>🔗 Ready to Explore?</h2>
        <p>Join LifeLine to experience the future of healthcare—today.</p>
        <a href="/signup">
          <button className="about-btn">Get Started 🚀</button>
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default About;
