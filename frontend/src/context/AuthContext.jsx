import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "../firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [firebaseUser, setFirebaseUser] = useState(null); 
  const [token, setToken] = useState(null); // ✅ Token state
  const [loading, setLoading] = useState(true);
  const wallet = useWallet();

  const syncWalletAddress = async () => {
    if (!wallet.publicKey || !firebaseUser) return;
    const currentAddress = wallet.publicKey.toBase58();
    if (user?.walletAddress === currentAddress) return; 

    try {
      const freshToken = await firebaseUser.getIdToken();
      const res = await axios.put(
        "https://lifeline3-1.onrender.com/api/auth/wallet",
        { walletAddress: currentAddress },
        { headers: { Authorization: `Bearer ${freshToken}` } }
      );
      setUser(res.data.user); 
    } catch (err) {
      console.error("❌ Failed to sync wallet address:", err);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const freshToken = await result.user.getIdToken();
      setToken(freshToken); // ✅ Store token

      const res = await axios.post(
        "https://lifeline3-1.onrender.com/api/auth/login",
        {
          email: result.user.email,
          name: result.user.displayName,
          uid: result.user.uid,
        },
        { headers: { Authorization: `Bearer ${freshToken}` } }
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
    setToken(null);
    window.location.href = "/login";
  };

  const getFreshToken = async () => {
    const current = auth.currentUser;
    if (!current) return null;
    const freshToken = await current.getIdToken(true);
    setToken(freshToken); // ✅ Update stored token
    return freshToken;
  };

  const refreshUser = async () => {
    const current = auth.currentUser;
    if (!current) return;
    try {
      const freshToken = await current.getIdToken(true);
      setToken(freshToken); // ✅ Refresh stored token

      const res = await axios.get("https://lifeline3-1.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${freshToken}` },
      });
      setFirebaseUser(current);
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const freshToken = await firebaseUser.getIdToken(true);
          setToken(freshToken); // ✅ Set token on session restore

          const res = await axios.get("https://lifeline3-1.onrender.com/api/auth/me", {
            headers: { Authorization: `Bearer ${freshToken}` },
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
        setToken(null); // ✅ Clear token
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (wallet.connected && firebaseUser) {
      syncWalletAddress();
    }
  }, [wallet.publicKey, wallet.connected, firebaseUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token, // ✅ Expose token
        loading,
        loginWithGoogle,
        logout,
        refreshUser,
        getFreshToken,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
