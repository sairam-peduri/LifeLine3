import '@solana/wallet-adapter-react-ui/styles.css';
import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import About from "./pages/About";
import BookAppointment from "./pages/BookAppointment";
import ChatList from "./pages/ChatList";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import DoctorDirectory from "./pages/DoctorDirectory";
import DoctorProfile from "./pages/DoctorProfile";
import EditAvailability from "./pages/EditAvailability";
import EditProfile from "./pages/EditProfile";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ManageAppointments from "./pages/ManageAppointments";
import MyAppointments from "./pages/MyAppointments";
import PatientDoctorChat from "./pages/PatientDoctorChat";
import PaymentPage from "./pages/PaymentPage";
import PredictionHistory from "./pages/PredictionHistory";
import Profile from "./pages/Profile";
import SignupDetails from "./pages/SignupDetails";
import TransactionHistory from "./pages/TransactionHistory";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<ProtectedRoute><SignupDetails /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute><DoctorDirectory /></ProtectedRoute>} />
          <Route path="/doctor/:uid" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
          <Route path="/set-availability" element={<ProtectedRoute><EditAvailability /></ProtectedRoute>} />
          <Route path="/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/manage-appointments" element={<ProtectedRoute><ManageAppointments /></ProtectedRoute>} />
          <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
          <Route path="/pay/:doctorId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/chat/:doctorId" element={<ProtectedRoute><PatientDoctorChat /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><PredictionHistory /></ProtectedRoute>} />
          <Route path="/about" element={<About/>}/>
          <Route path="/contact" element={<Contact/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
