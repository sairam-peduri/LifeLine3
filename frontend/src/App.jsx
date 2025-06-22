import '@solana/wallet-adapter-react-ui/styles.css';
import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import "./App.css"; // Import your global styles
import About from "./pages/About"; // ✅ NEW
import ChatList from "./pages/ChatList"; // ✅ NEW
import Contact from "./pages/Contact"; // ✅ NEW
import Dashboard from "./pages/Dashboard";
import DoctorDirectory from "./pages/DoctorDirectory";
import DoctorProfile from "./pages/DoctorProfile"; // ✅ NEW
import Home from "./pages/Home";
import Login from "./pages/Login";
import PatientDoctorChat from "./pages/PatientDoctorChat"; // ✅ NEW
import PaymentPage from "./pages/PaymentPage"; // ✅ NEW
import Profile from "./pages/Profile";
import SignupDetails from "./pages/SignupDetails";
import TransactionHistory from "./pages/TransactionHistory"; // ✅ NEW

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
          <Route path="/doctors" element={<ProtectedRoute><DoctorDirectory /></ProtectedRoute>} />
          {/* ✅ CHAT ROUTES */}
          <Route path="/doctor/:uid" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
          <Route path="/pay/:doctorId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/chat/:doctorId" element={<ProtectedRoute><PatientDoctorChat /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
          <Route path="/about" element={<About/>}/>
          <Route path="/contact" element={<Contact/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
