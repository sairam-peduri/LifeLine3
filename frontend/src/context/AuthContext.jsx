// src/context/AuthContext.jsx
import axios from "axios";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "../firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Custom backend user
  const [firebaseUser, setFirebaseUser] = useState(null); // Firebase Auth user
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: result.user.email,
          name: result.user.displayName,
          uid: result.user.uid,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFirebaseUser(result.user);
      setUser(res.data.user);

      if (res.data.isNewUser || !res.data.user.isProfileComplete) {
        window.location.href = "/signup";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true);
          const res = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setFirebaseUser(firebaseUser);
          setUser(res.data.user);
        } catch (err) {
          console.error("Failed to restore session:", err);
          setFirebaseUser(null);
          setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUser = async () => {
    const current = auth.currentUser;
    if (!current) return;
    try {
      const token = await current.getIdToken(true);
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFirebaseUser(current);
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, loginWithGoogle, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
