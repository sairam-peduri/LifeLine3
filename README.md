
# 🧬 LifeLine: Decentralized AI-Powered Healthcare Platform

Millions face delays, high costs, and limited access to quality healthcare—especially in underserved regions. **LifeLine** addresses this by combining **AI**, **blockchain**, and **real-time communication** into a single, accessible Web3 DApp.

## 🎥 Demo

🔗 [Live Demo](https://life-line-sol.vercel.app)

## Overview

**LifeLine** is a Web3-based healthcare platform where patients can consult verified doctors, receive AI-driven health predictions, and manage appointments—all within a secure, decentralized ecosystem. With real-time chat, disease prediction, appointment booking, and wallet payments, LifeLine aims to bring accessible healthcare to everyone.

This decentralized approach ensures:

- ✅ Doctor authenticity through wallet verification
- ✅ Secure health data with real-time access
- ✅ Fast disease predictions using ML models
- ✅ SOL-based consultations and payments

## ✨ Platform Features

### 👤 User System
- [x] Google/Firebase-based signup & login
- [x] Role-based access: Patient / Doctor
- [x] Profile editing (name, gender, bio, etc.)
- [x] Wallet integration for payments

### 📅 Appointments
- [x] Doctors set weekly availability
- [x] Patients view and book available slots
- [x] Real-time availability check
- [x] Accept/reject appointments
- [x] Notifications when appointment is accepted

### 💬 Real-time Chat
- [x] Patient-doctor messaging
- [x] Messages saved in MongoDB
- [x] Socket.io integration for instant updates
- [x] Chat list view with conversation sorting

### 🧠 AI Symptom Prediction
- [x] Flask ML model predicts disease from symptoms
- [x] Probability-based prediction
- [x] Timeline of predictions stored
- [x] Option to delete history entries

### 💸 Web3 Payments
- [x] Solana + Phantom wallet integration
- [x] Consultation fee payment from patient to doctor
- [x] Wallet address stored in profiles

### 📊 Dashboard
- [x] View symptoms, predictions, and bot chat
- [x] View doctor's availability
- [x] Book appointments and receive status

### 🧾 Health Records
- [ ] Upload/share health documents
- [ ] Download prediction reports

## Architecture

The platform consists of the following components:

### Frontend

- React.js + Tailwind CSS
- React Router DOM
- Firebase Authentication
- Solana Wallet Adapter
- Axios for backend communication
- Socket.IO Client

### Backend (Node.js/Express)

- Express.js REST API
- Firebase Admin SDK (token verification)
- MongoDB via Mongoose
- Socket.IO Server for real-time chat
- Appointment scheduling & availability
- Doctor verification logic
- Notifications via real-time events

### Backend (Flask ML API)

- Python Flask API
- Trained model for symptom-based disease prediction
- Routes: `/get_symptoms`, `/predict`

## How It Works

1. **User Signup/Login**: Firebase handles authentication. Role (patient/doctor) and wallet address stored in MongoDB.
2. **Doctor Sets Availability**: Weekly time slots are configured.
3. **Patient Searches & Books**: Frontend fetches available time slots and allows booking.
4. **Doctor Accepts/Rejects**: Real-time notifications are sent on decision.
5. **Chat System**: Socket.io manages doctor-patient chat, storing messages in MongoDB.
6. **Disease Prediction**: Patient submits symptoms → Flask API → Disease prediction returned.
7. **Payment Flow**: Patients pay SOL via wallet to doctor's wallet for consultations.

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas or Local MongoDB
- Firebase project with service account
- Python + Flask server deployed

### Installation

```bash
# Backend Setup
cd backend
npm install
# Create a .env file with:
# MONGO_URI=
# FIREBASE_SERVICE_ACCOUNT_JSON=
# CORS_ORIGIN=https://life-line-sol.vercel.app
node server.js

### 🤝 Contributing

We welcome contributions to improve **LifeLine**!

1. Fork this repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your message"`
4. Push to your forked repo: `git push origin feature/your-feature-name`
5. Submit a pull request to the `main` branch.

Please follow our coding guidelines and submit clear, well-documented PRs.

### 🪪 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.
### 🙏 Acknowledgments

- 🤖 **Flask ML Team** – For powering the disease prediction API.
- 🌐 **Solana Foundation** – For supporting decentralized Web3 infrastructure.
- 🔐 **Firebase** – For seamless authentication and secure user management.
- 🧠 **OpenAI** – For chatbot integration and intelligent responses.

---

### 🧬 LifeLine — Bridging gaps in healthcare through decentralized, intelligent infrastructure.
