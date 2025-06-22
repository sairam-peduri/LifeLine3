
import React, { useEffect } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
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
    <div>
      <Navbar />
      <section className="reveal contact-section contactsec">
        <h1>Contact Us</h1>
        <p>Need help? We’re here for you.</p>
        <p>Email us at <a href="mailto:sairampeduri@gmail.com">sairampeduri@gmail.com</a></p>
        <p>Or connect via:</p>
        <ul>
          <li><a href="https://www.linkedin.com/in/peduri-venkata-sairam">LinkedIn Page</a></li>
          <li><a href="https://facebook.com/lifeline">Facebook Community</a></li>
        </ul>
        <p>We aim to respond within 24 hours.</p>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
