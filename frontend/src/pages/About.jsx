// src/pages/About.jsx
import React, { useEffect } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
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
    <div>
      <Navbar />
      <section className="reveal about-section">
        <h1>About Life Line</h1>
        <p>Life Line is a telehealth platform connecting patients and doctors seamlessly via chat and payments on Solana.</p>
        <p>🔥 Key Features:</p>
        <ul>
          <li>Google Sign-In via Firebase for secure authentication.</li>
          <li>Real-time chat between doctors and patients.</li>
          <li>Secure payments in SOL using Phantom.</li>
          <li>Winter-backed storage for private health records (coming soon!).</li>
          <li>Access your prediction history with interactive charts.</li>
        </ul>
        <p className="mt-4">Life Line solves the problem of remote access to medical advice, making consultations, payments, and chat frictionless from anywhere.</p>
      </section>
      <Footer />
    </div>
  );
};

export default About;
