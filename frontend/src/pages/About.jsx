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
        <p className="about-paragraph">
          <strong>LifeLine</strong> is an intelligent Web3-powered healthcare assistant platform
          that empowers users to detect diseases early, consult doctors directly, and manage their
          health records securely. By combining machine learning-based disease prediction with
          real-time symptom analysis, LifeLine offers accurate and fast health insights based on
          user inputs. Users can browse a verified directory of doctors, chat privately with them,
          and make secure wallet-based payments for consultations using Solana. The platform
          supports both patients and doctors with tailored profiles and integrates Firebase
          authentication for a seamless login experience. With a focus on decentralization, privacy,
          and accessibility, LifeLine aims to revolutionize preventive healthcare and make expert
          medical guidance reachable from anywhere.
        </p>
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
