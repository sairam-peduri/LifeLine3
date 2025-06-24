import React, { useEffect } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./Contact.css";
import "./Reveal.css";

const Contact = () => {
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
    <div className="contact-page">
      <Navbar />
      <section className="hero-contact reveal">
        <h1>📬 Get in Touch</h1>
        <p>We're here to help you connect, collaborate, and stay informed.</p>
      </section>

      <section className="contact-section reveal">
        <h2>📧 Contact Information</h2>
        <p>
          You can reach us at:
          <br />
          <a href="mailto:sairampeduri@gmail.com" className="contact-link">
            sairampeduri@gmail.com
          </a>
        </p>

        <h2>🌍 Social Channels</h2>
        <ul className="social-links">
          <li>
            <a href="https://www.linkedin.com/in/peduri-venkata-sairam" target="_blank" rel="noreferrer">
              🔗 LinkedIn Profile
            </a>
          </li>
          <li>
            <a href="https://facebook.com/lifeline" target="_blank" rel="noreferrer">
              👥 Facebook Community
            </a>
          </li>
        </ul>

        <p className="response-note">
          We typically respond within <strong>24 hours</strong>. Whether you’re a doctor,
          patient, or contributor — we’re excited to hear from you!
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
